import { promises as fs } from "fs";
import * as path from "path";
import BaseEntity from "../../entities/BaseEntity";

class FileRepository<T extends BaseEntity> {
    private readonly filePath: string;

    constructor(fileName: string) {
        this.filePath = path.resolve(__dirname, `../data/${fileName}.json`);
    }

    private async ensureFileExists(): Promise<void> {
        const dir = path.dirname(this.filePath);

        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (e) {
            throw  new Error(`While creating directory ${dir}: ${e}`);
        }

        try {
            await fs.access(this.filePath);
        } catch {
            await fs.writeFile(this.filePath, "[]", "utf-8");
        }
    }

    async read(): Promise<T[]> {
        await this.ensureFileExists();
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(data);
        } catch (err) {
            throw  new Error(`While reading the file ${this.filePath}: ${err}`);
        }
    }

    async insert(newEl: T): Promise<void> {
        const all = await this.read();
        all.push(newEl);
        await this.writeAll(all);
    }

    async writeAll(data: T[]): Promise<void> {
        await this.ensureFileExists();
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
}

export default FileRepository;
