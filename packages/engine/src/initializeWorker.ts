import _ from 'lodash';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { createWorker, MessageType, WorkerProxy, Message } from './worker/MessageQueue';
import { createCanvas } from './renderer/functions/createCanvas';
import { EngineProxy } from './EngineProxy';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { InputSystem } from './input/systems/ClientInputSystem';
import { registerSystem } from './ecs/functions/SystemFunctions';
import { Engine } from './ecs/classes/Engine';
import { Timer } from './common/functions/Timer';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { SystemUpdateType } from './ecs/functions/SystemUpdateType';
import { Network } from './networking/classes/Network';
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem';
import { SystemProxy, SYSTEM_PROXY } from './worker/SystemProxy';

const isSafari = typeof navigator !== 'undefined' && /Version\/[\d\.]+.*Safari/.test(window.navigator.userAgent);

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
    useWebXR: !isSafari,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  state: {
    schema: CharacterStateSchema
  },
};

class WorkerEngineProxy extends EngineProxy {
  workerProxy: WorkerProxy;
  constructor(workerProxy: WorkerProxy) {
    super();
    this.workerProxy = workerProxy;
    this.workerProxy.addEventListener('sendData', (ev: any) => { this.sendData(ev.detail.buffer) })
    const serverConnect = () => {
      this.workerProxy.sendEvent('NETWORK_CONNECT_EVENT', { })
      document.removeEventListener('server-connected', serverConnect)
    }
    document.addEventListener('server-connected', serverConnect)

    this.workerProxy.addEventListener(SYSTEM_PROXY.EVENT_ADD, (ev: any) => {
      const { type, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      const listener = (event: any) => {
        this.workerProxy.sendEvent(SYSTEM_PROXY.EVENT, { event, system })
      };
      // @ts-ignore
      if(!systemType.instance.proxyListener) {
        // @ts-ignore
        systemType.instance.proxyListener = listener;
      }
      systemType.instance.addEventListener(type, listener)
    });
    this.workerProxy.addEventListener(SYSTEM_PROXY.EVENT_REMOVE, (ev: any) => {
      const { type, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      // @ts-ignore
      systemType.instance.removeEventListener(type, systemType.instance.proxyListener)
    });
    this.workerProxy.addEventListener(SYSTEM_PROXY.EVENT, (ev: any) => {
      ev.preventDefault = () => {};
      ev.stopPropagation = () => {};
      delete ev.target;
      const { event, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      // @ts-ignore
      systemType.instance.dispatchEvent(event, true);
    });
  }
  loadScene(result) { 
    this.workerProxy.sendEvent('NETWORK_INITIALIZE_EVENT', {
      userId: Network.instance.userId,
      userNetworkId: Network.instance.userNetworkId,
    })
    this.workerProxy.sendEvent('loadScene', { result })
  }
  transferNetworkBuffer(buffer, delta) { this.workerProxy.sendEvent('transferNetworkBuffer', { buffer, delta }, [buffer]); }
  setActorAvatar(entityID, avatarID) { this.workerProxy.sendEvent('setActorAvatar', { entityID, avatarID }); }
}

export async function initializeWorker(initOptions: any = DefaultInitializationOptions): Promise<void> {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  const workerProxy: WorkerProxy = await createWorker(
    // @ts-ignore
    new Worker(new URL('./entry.worker.ts', import.meta.url)),
    (options.renderer.canvas || createCanvas()),
    {
      env: {
        ...process?.env,
      },
      useWebXR: !isSafari
    }
  );
  EngineProxy.instance = new WorkerEngineProxy(workerProxy);
  initialize()
  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(MediaStreamSystem);
  // registerSystem(InputSystem, { useWebXR: DefaultInitializationOptions.input.useWebXR });
  // @ts-ignore
  WebGLRendererSystem.instance = new SystemProxy('WebGLRendererSystem');
  
  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
  }, 1000);

  return await new Promise((resolve) => {
    const onNetworkConnect = () => {
      window.removeEventListener('connectToWorld', onNetworkConnect)
      resolve()
    }
    window.addEventListener('connectToWorld', onNetworkConnect)
  })
}
