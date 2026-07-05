import agentImage from '../assets/agent.png'

// 左パネル上部：エージェントのキャラクター画像
export function AgentImage() {
  return (
    <div className="agent-image-area">
      <img src={agentImage} className="agent-image" alt="エージェントキャラクター" />
    </div>
  )
}
