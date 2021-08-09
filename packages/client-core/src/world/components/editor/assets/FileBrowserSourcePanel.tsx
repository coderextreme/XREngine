import React, { Component, useRef } from 'react'
import { List, ListItem } from 'semantic-ui-react'
import { unique } from '../../../../../../engine/src/editor/functions/utils'
import { Api } from '../Api'
import { withEditor } from '../contexts/EditorContext'
import { Column } from '../layout/Flex'
import { ImageMediaGridItem, MediaGrid, VideoMediaGridItem } from '../layout/MediaGrid'
import AssetGrid, { MemoAssetGridItem } from './AssetGrid'
import AudioPreview from './AudioPreview'

/**
 * UploadFileType Enum is used for File Types.
 *
 * @author Abhishek Pathak
 */
export enum UploadFileType {
  'Image',
  'Model',
  'Vedio',
  'Audio',
  'Volumetric',
  'Link'
}

/**
 * FileBrowserSourcePanel used to render editor view to see the project files available in a project.
 *
 * @author Abhishek Pathak
 * @extends Component
 */

class FileBrowserSourcePanel extends Component {
  //setting the props and state
  constructor(props) {
    super(props)
  }

  onFileUploaded = () => {
    this.setState({})
  }

  // adding listeners when component get mounted
  componentDidMount() {
    const editor = (this.props as any).editor
    editor.addListener('fileUploaded', this.onFileUploaded)
  }

  // removing listeners when components get unmounted
  componentWillUnmount() {
    const editor = (this.props as any).editor
    editor.removeListener('fileUploaded', this.onFileUploaded)
  }

  onClickItem = () => {}

  renderUploadFilesTypes(file) {
    const type = file.type

    switch (
      type
      // case (UploadFileType.Image):
      //   return <ImageMediaGridItem src={file.url} onClick={this.onClickItem} label={file.name} {...file} />

      // case(UploadFileType.Vedio):
      //   return <VideoMediaGridItem src={file.url} onClick={this.onClickItem} label={file.name} {...file} />

      // case(item.iconComponent) {
      //   //setting content as IconMediaGridItem component if item contains iconComponent
      //   return (
      //     <IconMediaGridItem iconComponent={item.iconComponent} onClick={onClickItem} label={item.label} {...rest} />
      //   )
      // } else {
      //   //setting content as ImageMediaGridItem if all above cases are false
      //   // @ts-ignore
      //   content = <ImageMediaGridItem onClick={onClickItem} label={item.label} {...rest} />
      // }

      // case(UploadFileType.Audio):
      //   return <AudioPreview src={file.url}/>
    ) {
    }
    return <div></div>
  }
  //rendering editor views for customization of element properties
  render() {
    const editor = (this.props as any).editor
    const lis = (editor.api as Api).filesToUpload

    return (
      <div>
        This is the File Browser Panel <div>{this.renderUploadFilesTypes(lis)}</div>
      </div>
    )
  }
}

export default withEditor(FileBrowserSourcePanel)
