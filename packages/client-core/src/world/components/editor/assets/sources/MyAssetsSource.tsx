import { BaseSource } from './index'
import UploadSourcePanel from '../UploadSourcePanel'
import ModelNode from '@xrengine/engine/src/editor/nodes/ModelNode'
import VideoNode from '@xrengine/engine/src/editor/nodes/VideoNode'
import ImageNode from '@xrengine/engine/src/editor/nodes/ImageNode'
import AudioNode from '@xrengine/engine/src/editor/nodes/AudioNode'
import { AcceptsAllFileTypes } from '../fileTypes'
import i18n from 'i18next'
import Editor from '../../Editor'

/**
 * @author Abhishek Pathak
 */

export enum UploadFileType {
  'NativeFile',
  'Model',
  'Image',
  'Video',
  'Audio',
  'Volumetric',
  'Element'
}

/**
 * @author Abhishek Pathak
 */
export const UploadFileTypeToNode = new Map<number, Object>([
  [UploadFileType.Audio, AudioNode],
  [UploadFileType.Video, VideoNode],
  [UploadFileType.Image, ImageNode],
  [UploadFileType.Model, ModelNode]
])

/**
 * @author Abhishek Pathak
 */

export class MyAssetsSource extends BaseSource {
  component: typeof UploadSourcePanel
  editor: Editor
  tags: { label: string; value: string }[]
  searchLegalCopy: string
  privacyPolicyUrl: string
  uploadMultiple: boolean
  acceptFileTypes: string
  constructor(editor) {
    super()
    this.component = UploadSourcePanel
    this.editor = editor
    this.id = 'assets'
    this.name = i18n.t('editor:sources.myAssets.name')
    this.tags = [
      { label: 'Models', value: 'model' },
      { label: 'Images', value: 'image' },
      { label: 'Videos', value: 'video' },
      { label: 'Audio', value: 'audio' }
    ]
    this.searchLegalCopy = 'Search by Mozilla Hubs'
    this.privacyPolicyUrl = 'https://github.com/XRFoundation/XREngine/blob/master/PRIVACY.md'
    this.uploadSource = true
    this.uploadMultiple = true
    this.acceptFileTypes = AcceptsAllFileTypes
    this.requiresAuthentication = true
  }
  async upload(files, onProgress, abortSignal) {
    const assets = await this.editor.api.uploadAssets(this.editor, files, onProgress, abortSignal)
    this.emit('resultsChanged')
    return assets
  }
  async delete(item) {
    await this.editor.api.deleteAsset(item.id)
    this.emit('resultsChanged')
  }
  async search(params, cursor, abortSignal) {
    const { results } = await this.editor.api.searchMedia(
      this.id,
      {
        query: params.query,
        type: params.tags && params.tags.length > 0 && params.tags[0].value
      },
      cursor,
      abortSignal
    )
    //console.log("Returned Item"+JSON.stringify(returned))
    return {
      results: results.map((result) => {
        const thumbnailUrl = 'url' //result && result.images && result.images.preview && result.images.preview.url
        const nodeClass = UploadFileTypeToNode.get(UploadFileType.Model) //result.type]
        // const iconComponent = thumbnailUrl
        //   ? null
        //   : this.editor.nodeEditors.get(nodeClass).WrappedComponent
        //   ? this.editor.nodeEditors.get(nodeClass).WrappedComponent.iconComponent
        //   : this.editor.nodeEditors.get(nodeClass).iconComponent

        const iconComponent = this.editor.nodeEditors.get(nodeClass).iconComponent
        const ownedFiles = result.ownedFileIds

        return {
          project: result,
          id: 'result.id',
          thumbnailUrl,
          iconComponent,
          label: result.name,
          type: 'UploadFileType.Model',
          url: result.url,
          nodeClass,
          initialProps: {
            name: result.name,
            src: result.url
          }
        }
      }),
      suggestions: null,
      nextCursor: null,
      hasMore: false //!!nextCursor
    }
  }
}
