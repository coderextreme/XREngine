import React, { Component } from 'react'
import { Api } from '../Api'
import { withEditor } from '../contexts/EditorContext'

/**
 * FileBrowserSourcePanel used to render editor view to see the project files available in a project.
 *
 * @author Abhishek Pathak
 * @extends Component
 */
export enum UploadFileTypes {
  'Image',
  'Model',
  'Vedio',
  'Audio',
  'Volumetric',
  'Link'
}

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

  //rendering editor views for customization of element properties
  render() {
    const editor = (this.props as any).editor
    const lis = (editor.api as Api).filesToUpload
    console.log('List Present is:' + JSON.stringify(lis))
    return <div>This is the File Browser Panel</div>
  }
}

export default withEditor(FileBrowserSourcePanel)
