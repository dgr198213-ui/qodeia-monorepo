export class Registry {
  private specialists = new Map<string, any>()

  register(name: string, specialist: any) {
    this.specialists.set(name, specialist)
  }

  get(name: string) {
    return this.specialists.get(name)
  }
}
