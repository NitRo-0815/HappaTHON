import os
import json
import re
import requests
from bs4 import BeautifulSoup
from canvasapi import Canvas
from dotenv import load_dotenv

# 同じフォルダに配置したJSONデータベースへのパス（どこに移動しても動くように絶対パス化）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYLLABUS_DB_PATH = os.path.join(BASE_DIR, "all_syllabi_fast.json")

def load_syllabus_db(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def extract_syllabus_details(url):
    """URLからシラバスの詳細（授業計画、ねらい、評価方法などすべて）を動的にスクレイピングして取得する"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        details = {}
        # 授業のねらい、到達目標、評価方法など、table_1の全情報を取得
        for th, td in zip(soup.select('.table_1 th'), soup.select('.table_1 td')):
            key = ' '.join(th.get_text(strip=True).split())
            value = ' '.join(td.get_text(strip=True).split())
            details[key] = value
            
        plan = []
        for i, td in enumerate(soup.select('table:nth-of-type(3) td.number + td')):
            # get_textの際にセパレータとして改行を入れることで、<br>等の構造タグ由来の区切りを保持する
            content = td.get_text(separator='\n', strip=True)
            plan.append({
                "回数": f"第{i+1}回",
                "内容": content
            })
            
        details['授業計画'] = plan
        return details
    except Exception as e:
        print(f"  [シラバス取得エラー] {e}")
        return None

def get_user_tasks_with_syllabus(api_key):
    """
    アプリケーション本体から呼び出されるAPI用の関数。
    Canvasの課題と、それに紐づくシラバス情報（ねらい、評価方法など）をセットにして返す。
    これをOpenRouterのプロンプト構築に渡す。
    """
    canvas = Canvas(os.getenv("CANVAS_API_URL", "https://nu.instructure.com"), api_key)
    syllabus_data = load_syllabus_db(SYLLABUS_DB_PATH)
    
    if not syllabus_data:
        raise Exception("シラバスデータベースが見つかりません。")

    results = []
    
    # ユーザーのコース一覧を取得
    courses = canvas.get_courses()
    
    for course in courses:
        try:
            course_name = course.name
            
            # まずそのコースに未提出の課題などがあるか確認
            assignments = list(course.get_assignments())
            if not assignments:
                continue # 課題がないコースはAIに渡す必要がないのでスキップ
                
            # 「総合研究（〇〇）」などの場合、〇〇の部分を取り出して検索キーにする
            search_keys = [course_name]
            match = re.search(r'[（\(](.*?)[）\)]', course_name)
            if match:
                search_keys.append(match.group(1))

            matched_syllabus = None
            for s in syllabus_data:
                db_name = s.get("科目名", "")
                if not db_name:
                    continue
                for key in search_keys:
                    if db_name in key or key in db_name:
                        matched_syllabus = s
                        break
                if matched_syllabus:
                    break

            course_info = {
                "course_name": course_name,
                "assignments": [{"name": a.name, "due_at": a.due_at} for a in assignments],
                "syllabus": None
            }

            if matched_syllabus:
                url = matched_syllabus.get('url')
                details = extract_syllabus_details(url)
                if details:
                    # 取得したすべてのタグ情報（教科書、評価方法、ねらい等）をそのままAIに渡す
                    details["url"] = url
                    course_info["syllabus"] = details
            
            results.append(course_info)
            
        except Exception as e:
            continue
            
    return results

if __name__ == "__main__":
    import sys
    
    # Node.jsなどから呼び出された際に、APIキーを引数として受け取る
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        # 引数がない場合は.envから読み込む（単体テスト用）
        load_dotenv()
        api_key = os.getenv("CANVAS_API_KEY")
        
    if not api_key:
        print(json.dumps({"error": "APIキーが提供されていません。"}, ensure_ascii=False))
        sys.exit(1)
        
    try:
        data = get_user_tasks_with_syllabus(api_key)
        # バックエンドプログラム（Node.jsなど）がJSON.parse()できるように、純粋なJSON文字列だけを出力する
        print(json.dumps(data, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)
