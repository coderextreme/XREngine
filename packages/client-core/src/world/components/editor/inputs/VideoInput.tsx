// @ts-nocheck
import React from 'react'
import PropTypes from 'prop-types'
import StringInput from './StringInput'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../dnd'
import useUpload from '../assets/useUpload'
import { VideoFileTypes } from '../assets/fileTypes'

const uploadOptions = {
  multiple: false,
  accepts: VideoFileTypes
}

/**
 *
 * @author Robert Long
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function VideoInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions)
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Video, ItemTypes.File],
    drop(item) {
      if (item.type === ItemTypes.Video) {
        onChange((item as any).value.url, (item as any).value.initialProps || {})
      } else {
        onUpload((item as any).files).then((assets) => {
          if (assets && assets.length > 0) {
            onChange(assets[0].url, {})
          }
        })
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <StringInput ref={dropRef} onChange={onChange} error={isOver && !canDrop} canDrop={isOver && canDrop} {...rest} />
  )
}

VideoInput.propTypes = {
  onChange: PropTypes.func.isRequired
}
export default VideoInput
