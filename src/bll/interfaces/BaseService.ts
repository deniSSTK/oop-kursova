import BaseEntity from "../../entities/BaseEntity";
import FileRepository from "../../dal/repositories/FileRepository";

class BaseService<T extends BaseEntity> {
    readonly repo: FileRepository<T>;

    constructor(repo: FileRepository<T>) {
        this.repo = repo
    }

    async delete(id: string): Promise<boolean> {
        try {
            const all = await this.repo.read();
            await this.repo.writeAll(all.filter(item => item.id !== id));
            return true;
        } catch (err) {
            return false;
        }
    }

    async update(updatedItem: T): Promise<boolean> {
        const all = await this.repo.read();
        const targetIndex = all.findIndex(item => item.id === updatedItem.id);

        if (targetIndex === -1) return false

        all[targetIndex] = updatedItem;
        await this.repo.writeAll(all)
        return true;
    }

    async getById(id: string): Promise<T | null> {
        const all = await this.repo.read();
        return all.filter(item => item.id === id)[0]
    }

    getAll(): Promise<T[]> {
        return this.repo.read();
    }
}

export default BaseService;