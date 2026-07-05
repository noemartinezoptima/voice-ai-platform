import SayNode from './SayNode';
import AskNode from './AskNode';
import LLMNode from './LLMNode';
import ConditionNode from './ConditionNode';
import GotoNode from './GotoNode';
import TransferNode from './TransferNode';
import HangupNode from './HangupNode';
import WebhookNode from './WebhookNode';
import KnowledgeNode from './KnowledgeNode';

const nodeTypes = {
  say: SayNode,
  ask: AskNode,
  llm: LLMNode,
  condition: ConditionNode,
  goto: GotoNode,
  transfer: TransferNode,
  webhook: WebhookNode,
  knowledge: KnowledgeNode,
  hangup: HangupNode,
};

export default nodeTypes;
