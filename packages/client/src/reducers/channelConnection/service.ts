import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { Config } from '@xrengine/client-core/src/helper'
import { Dispatch } from 'redux'
import { client } from '@xrengine/client-core/src/feathers'
import Store from '@xrengine/client-core/src/store'

import {
  channelServerConnected,
  channelServerConnecting,
  channelServerDisconnected,
  channelServerProvisioned,
  channelServerProvisioning
} from './actions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { triggerUpdateConsumers } from '../mediastream/service'

const store = Store.store

export function provisionChannelServer(instanceId?: string, channelId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(channelServerProvisioning())
    const token = getState().get('auth').get('authUser').accessToken
    if (instanceId != null) {
      const instance = await client.service('instance').find({
        query: {
          id: instanceId
        }
      })
      if (instance.total === 0) {
        instanceId = null
      }
    }
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    })
    if (provisionResult.ipAddress != null && provisionResult.port != null) {
      dispatch(channelServerProvisioned(provisionResult, channelId))
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE
      })
    }
  }
}

export function connectToChannelServer(channelId: string, isHarmonyPage?: boolean) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(channelServerConnecting())
      const authState = getState().get('auth')
      const user = authState.get('user')
      const token = authState.get('authUser').accessToken
      const channelConnectionState = getState().get('channelConnection')
      const instance = channelConnectionState.get('instance')
      const locationId = channelConnectionState.get('locationId')
      const locationState = getState().get('locations')
      const currentLocation = locationState.get('currentLocation').get('location')
      const sceneId = currentLocation.sceneId
      const videoActive =
        MediaStreams !== null &&
        MediaStreams !== undefined &&
        (MediaStreams.instance?.camVideoProducer != null || MediaStreams.instance?.camAudioProducer != null)
      // TODO: Disconnected
      if (Network.instance !== undefined && Network.instance !== null) {
        await endVideoChat({ endConsumers: true })
        await leave(false)
      }

      try {
        await Network.instance.transport.initialize(instance.get('ipAddress'), instance.get('port'), false, {
          locationId: locationId,
          token: token,
          user: user,
          sceneId: sceneId,
          startVideo: videoActive,
          channelType: 'channel',
          channelId: channelId,
          videoEnabled:
            currentLocation?.locationSettings?.videoEnabled === true ||
            !(
              currentLocation?.locationSettings?.locationType === 'showroom' &&
              user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation.id) == null
            ),
          isHarmonyPage: isHarmonyPage
        })
      } catch (error) {
        console.error('Network transport could not initialize, transport is: ', Network.instance.transport)
      }

      ;(Network.instance.transport as SocketWebRTCClientTransport).left = false
      EngineEvents.instance.addEventListener(MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS, triggerUpdateConsumers)

      MediaStreams.instance.channelType = 'channel'
      MediaStreams.instance.channelId = channelId
      dispatch(channelServerConnected())
    } catch (err) {
      console.log(err)
    }
  }
}

export function resetChannelServer() {
  return async (dispatch: Dispatch): Promise<any> => {
    const channelRequest = (Network.instance?.transport as any)?.channelRequest
    if (channelRequest != null) (Network.instance.transport as any).channelRequest = null
    dispatch(channelServerDisconnected())
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance-provision').on('created', (params) => {
    if (params.channelId != null) store.dispatch(channelServerProvisioned(params, params.channelId))
  })
}
