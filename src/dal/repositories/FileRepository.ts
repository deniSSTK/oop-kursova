import { promises as fs } from "fs";
import BaseEntity from "../../entities/BaseEntity";

class FileRepository<T extends BaseEntity> {
    private readonly filePath: string;

    constructor(fileName: string) {
        this.filePath = `../data/${fileName}.json`;
    }

    async read(): Promise<T[]> {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(data);
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                return [];
            }
            throw `[ERROR] While reading the file ${this.filePath}, ${err}`;
        }
    }

    async insert(newEl: T): Promise<void> {
        const all = await this.read();
        all.push(newEl);
        await this.writeAll(all);
    }

    async writeAll(data: T[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
}

export default FileRepository;