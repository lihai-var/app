const types = [
  'build', // 修改项目的的构建系统（xcodebuild、webpack、glup等）的提交
  'ci', // 修改项目的持续集成流程（Kenkins、Travis等）的提交
  'chore', // 构建过程或辅助工具的变化，翻译为日常琐事
  'docs', // 文档提交（documents）
  'feat', // 新功能（feature）
  'fix', // bug已经修复。 适合于一次提交直接修复问题
  'to', // bug还未修复。适合于多次提交。最终修复问题提交时使用fix
  'pref', // 优化相关，比如提升性能、体验（performance）
  'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
  'revert', // 回滚到上一个版本
  'style', // 不影响程序逻辑的代码修改、主要是样式方面的优化、修改
  'test', // 测试相关的开发
  'sync', // 同步主线或分支的Bug
]

typeEnum = {
  rules: {
    'type-enum': [2, 'always', types],
  },
  value: () => types,
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-case': [0],
    'type-empty': [2, 'never'],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
    'type-enum': typeEnum.rules['type-enum'],
  },
}
