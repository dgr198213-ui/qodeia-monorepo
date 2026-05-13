export class Delegation {
  delegate(task: string, specialist: string) {
    return {
      task,
      specialist,
      status: 'delegated'
    }
  }
}
