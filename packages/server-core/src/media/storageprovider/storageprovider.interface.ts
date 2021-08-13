export interface StorageProviderInterface {
  checkObjectExistence(key: string): Promise<any>
  getObject(path: string): Promise<any>
  getProvider(): StorageProviderInterface // arrow function
  getSignedUrl(key: string, expiresAfter: number, conditions): Promise<any>
  getStorage(): any
  listObjects(prefix: string): Promise<any>
  deleteResources(keys: string[]): Promise<any>
}
