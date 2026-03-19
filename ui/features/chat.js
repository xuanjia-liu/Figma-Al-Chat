export const chatInlineHandlerNames = [
  '_addCtxVarCustom',
  '_handleGenerateContextVars',
  '_removeCtxVarCustom',
  '_renderContextVarsUI',
  '_showCtxVarAddInput',
  '_toggleCtxVarChip',
  'closePromptDrawer',
  'directUIPhase1Submit',
  'executeBatchAiReply',
  'executeBatchReply',
  'renderPhase2History',
  'renderPhase2OutlineEditor',
  'switchBatchActionTab',
  'switchDirectUIPage'
];

export function isCapabilityQuestion(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return /(capabilit(y|ies)|ability|abilities|skills|features|what can you do|what do you do|what does this plugin do|how can you help|what are you able|plugin do|your functions|que puedes hacer|cuales son tus capacidades|tus habilidades|funciones del plugin|que puede hacer el plugin|o que voce pode fazer|o que você pode fazer|quais sao suas capacidades|suas habilidades|funcoes do plugin|funcionalidades do plugin|cosa puoi fare|quali sono le tue capacita|le tue abilita|funzioni del plugin|quelles sont tes capacites|que peux-tu faire|fonctionnalites du plugin|was kannst du|was kann das plugin|deine fähigkeiten|funktionen des plugins|что ты умеешь|ваши возможности|能做什么|可以做什么|功能|能力|插件能做什么|技能|プラグインは何ができる|何ができますか|できること|機能|무엇을 할 수|무엇을 할수|기능|능력)/.test(t);
}
