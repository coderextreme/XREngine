import EditorNodeMixin from './EditorNodeMixin'
import Video from '../../scene/classes/Video'
import Hls from 'hls.js'
import isHLS from '../functions/isHLS'

// @ts-ignore
export default class VideoNode extends EditorNodeMixin(Video) {
  static legacyComponentName = 'video'
  static nodeName = 'Video'
  static initialElementProps = {}
  static async deserialize(editor, json, loadAsync, onError) {
    const node = (await super.deserialize(editor, json)) as VideoNode
    const video = json.components.find((c) => c.name === 'video')
    if (video) {
      const { props } = video
      node.src = props.src
      node.interactable = props.interactable
      node.isLivestream = props.isLivestream
      node.controls = props.controls || false
      node.autoPlay = props.autoPlay
      node.synchronize = props.synchronize
      node.loop = props.loop
      node.audioType = props.audioType
      node.volume = props.volume
      node.distanceModel = props.distanceModel
      node.rolloffFactor = props.rolloffFactor
      node.refDistance = props.refDistance
      node.maxDistance = props.maxDistance
      node.coneInnerAngle = props.coneInnerAngle
      node.coneOuterAngle = props.coneOuterAngle
      node.coneOuterGain = props.coneOuterGain
      node.projection = props.projection
      node.elementId = props.elementId
    }
    return node
  }
  _canonicalUrl = ''
  autoPlay = true
  volume = 0.5
  controls = true
  interactable = false
  isLivestream = false
  synchronize = 0
  constructor(editor) {
    super(editor, editor.audioListener)
  }
  get src(): string {
    return this._canonicalUrl
  }
  set src(value) {
    this.load(value).catch(console.error)
  }
  async load(src, onError?) {
    const nextSrc = src || ''
    if (nextSrc === this._canonicalUrl && nextSrc !== '') {
      return
    }
    this._canonicalUrl = src || ''
    this.issues = []
    this.hideErrorIcon()
    if (this.editor.playing) {
      ;(this.el as any).pause()
    }
    if (!this._canonicalUrl || this._canonicalUrl === '') {
      return
    }
    try {
      const { url, contentType } = await this.editor.api.resolveMedia(src)
      const isHls = isHLS(src, contentType)
      if (isHls) {
        // this.hls = new Hls({
        //   xhrSetup: (xhr, url) => {
        //     xhr.open("GET", this.editor.api.unproxyUrl(src, url));
        //   }
        // });
        this.hls = new Hls()
      }
      super.load(src, contentType)
      if (isHls && this.hls) {
        this.hls.stopLoad()
      } else if ((this.el as any).duration) {
        ;(this.el as any).currentTime = 1
      }
      if (this.editor.playing && this.autoPlay) {
        ;(this.el as any).play()
      }
      ;(this.el as any).play()
    } catch (error) {
      this.showErrorIcon()
      // const videoError = new RethrownError(
      //   `Error loading video ${this._canonicalUrl}`,
      //   error
      // );
      // if (onError) {
      //   onError(this, videoError);
      // }
      // console.error(videoError);
      // this.issues.push({ severity: "error", message: "Error loading video." });
    }
    this.editor.emit('objectsChanged', [this])
    this.editor.emit('selectionChanged')
    // this.hideLoadingCube();
    return this
  }
  onPlay(): void {
    if (this.autoPlay) {
      ;(this.el as any).play()
    }
  }
  onPause(): void {
    ;(this.el as any).pause()
    ;(this.el as any).currentTime = 0
  }
  clone(recursive): VideoNode {
    return new (this as any).constructor(this.editor, this.audioListener).copy(this, recursive)
  }
  copy(source, recursive = true): any {
    super.copy(source, recursive)
    this.controls = source.controls
    this._canonicalUrl = source._canonicalUrl
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      video: {
        src: this._canonicalUrl,
        interactable: this.interactable,
        isLivestream: this.isLivestream,
        controls: this.controls,
        autoPlay: this.autoPlay,
        synchronize: this.synchronize,
        loop: this.loop,
        audioType: this.audioType,
        volume: this.volume,
        distanceModel: this.distanceModel,
        rolloffFactor: this.rolloffFactor,
        refDistance: this.refDistance,
        maxDistance: this.maxDistance,
        coneInnerAngle: this.coneInnerAngle,
        coneOuterAngle: this.coneOuterAngle,
        coneOuterGain: this.coneOuterGain,
        projection: this.projection,
        elementId: this.elementId
      }
    })
  }
  prepareForExport(): void {
    super.prepareForExport()
    this.addGLTFComponent('video', {
      src: this._canonicalUrl,
      interactable: this.interactable,
      isLivestream: this.isLivestream,
      controls: this.controls,
      autoPlay: this.autoPlay,
      synchronize: this.synchronize,
      loop: this.loop,
      audioType: this.audioType,
      volume: this.volume,
      distanceModel: this.distanceModel,
      rolloffFactor: this.rolloffFactor,
      refDistance: this.refDistance,
      maxDistance: this.maxDistance,
      coneInnerAngle: this.coneInnerAngle,
      coneOuterAngle: this.coneOuterAngle,
      coneOuterGain: this.coneOuterGain,
      projection: this.projection,
      elementId: this.elementId
    })
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
