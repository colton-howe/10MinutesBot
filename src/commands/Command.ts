export abstract class Command {
    abstract exec(params?: string[]): string;
}