import appRootPath from 'app-root-path'
import config from '../../appconfig'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path'
import { StorageProviderInterface } from './storageprovider.interface'

export class LocalStorage implements StorageProviderInterface {
  path = './upload'
  cacheDomain = config.server.localStorageProvider

  getObject = async (key: string): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, key)
    console.log('filePath', filePath)
    return fs.promises.readFile(filePath)
  }

  listObjects = async (prefix: string): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, prefix)
    if (!fs.existsSync(filePath)) await fs.promises.mkdir(filePath, {recursive: true})
    const globResult = glob.sync(path.join(filePath, '*.json'))
    return { Contents: globResult.map(result => { return {Key: result }}) }
  }

  getProvider = (): StorageProviderInterface => this
  getStorage = (): any => fsStore(this.path)

  checkObjectExistence = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, key)
      const exists = fs.existsSync(filePath)
      if (exists) reject(new Error('Pack already exists'))
      else resolve(null)
    })
  }

  getSignedUrl = (key: string, expiresAfter: number, conditions): any => {
    return {
      fields: {
        Key: key
      },
      url: `https://${this.cacheDomain}`,
      local: true,
      cacheDomain: this.cacheDomain
    }
  }

  deleteResources(keys: string[]): Promise<any> {
    const blobs = this.getStorage()

    return Promise.all(
      keys.map((key) => {
        return new Promise((resolve) => {
          blobs.exists(key, (err, exists) => {
            if (err) {
              console.error(err)
              resolve(false)
              return
            }

            if (exists)
              blobs.remove(key, (err) => {
                if (err) {
                  console.error(err)
                  resolve(false)
                  return
                }

                resolve(true)
              })

            resolve(true)
          })
        })
      })
    )
  }
}
export default LocalStorage
