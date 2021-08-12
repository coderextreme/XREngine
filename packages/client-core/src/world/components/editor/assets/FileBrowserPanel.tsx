import React, { useContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { AssetsPanelContainer, Column, Row } from '../layout/Flex'
import { EditorContext } from '../contexts/EditorContext'
import AssetDropZone from './AssetDropZone'
// @ts-ignore
import styles from './styles.module.scss'
import { useAssetSearch } from './useAssetSearch'
import { AssetPanelContentContainer } from './AssetsPanel'
import AssetGrid from './AssetGrid'

/**
 * getSources used to get sources out of editor and filter sources on the basis of requiresAuthentication or isAuthenticated.
 *
 * @author Robert Long
 * @param  {Object} editor
 * @return {any}        [description]
 */
function getSources(editor) {
  const isAuthenticated = editor.api.isAuthenticated()
  return editor.sources.filter((source) => !source.requiresAuthentication || isAuthenticated)
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserPanel() {
  //initializing editor with EditorContext
  const editor = useContext(EditorContext)

  //initializing sources using getSources from editor
  const [sources, setSources] = useState(getSources(editor))

  //initializing selectedSource as the first element of sources array
  const [selectedSource, setSelectedSource] = useState(sources.length > 0 ? sources[1] : null)
  const SourceComponent = selectedSource && selectedSource.component

  useEffect(() => {
    // function to set selected sources
    const onSetSource = (sourceId) => {
      setSelectedSource(sources.find((s) => s.id === sourceId))
    }

    //function to handle changes in authentication
    const onAuthChanged = () => {
      const nextSources = getSources(editor)
      setSources(nextSources)

      if (nextSources.indexOf(selectedSource) === -1) {
        setSelectedSource(nextSources.length > 0 ? nextSources[0] : null)
      }
    }

    // function to handle changes in authentication
    const onSettingsChanged = () => {
      const nextSources = getSources(editor)
      setSources(nextSources)
    }

    //adding listeners to editor component
    editor.addListener('settingsChanged', onSettingsChanged)
    editor.addListener('setSource', onSetSource)
    editor.api.addListener('authentication-changed', onAuthChanged)

    //removing listeners from editor component
    return () => {
      editor.removeListener('setSource', onSetSource)
      editor.api.removeListener('authentication-changed', onAuthChanged)
    }
  }, [editor, setSelectedSource, sources, setSources, selectedSource])

  //initializing savedSourceState with empty object
  const [savedSourceState, setSavedSourceState] = useState({})

  //initializing setSavedState
  const setSavedState = useCallback(
    (state) => {
      setSavedSourceState({
        ...savedSourceState,
        [selectedSource.id]: state
      })
    },
    [selectedSource, setSavedSourceState, savedSourceState]
  )
  //initializing saved state on the bases of  selected source
  const savedState = savedSourceState[selectedSource.id] || {}

  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(selectedSource)

  const onSelect = () => {
    console.log('On Selected')
  }

  return (
    <AssetsPanelContainer id="file-browser-panel" className={styles.assetsPanel}>
      <Column flex>
        <AssetPanelContentContainer>
          <AssetGrid
            source={selectedSource}
            items={results}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onSelect={onSelect}
            isLoading={false}
          />
        </AssetPanelContentContainer>
      </Column>
      <AssetDropZone />
    </AssetsPanelContainer>
  )
}
