export class ReadingFile extends Error {
    constructor(filePath: string, err: any) {
        super(`While reading the file ${filePath}: ${err}`);
        this.name = 'ReadingTheFile';
    }
}

export class CreatingDirectory extends Error {
    constructor(dir: string, err: any) {
        super(`While creating directory ${dir}: ${err}`);
        this.name = 'CreatingDirectory';
    }
}