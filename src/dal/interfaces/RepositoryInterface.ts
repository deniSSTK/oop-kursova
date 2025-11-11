import BaseEntity from "../../entities/BaseEntity";

interface IRepository<T extends BaseEntity> {
    ensureFileExists(): Promise<void>
    insert(newEl: T): Promise<void>
    writeAll(data: T[]): Promise<void>
}

export default IRepository;