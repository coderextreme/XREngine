import DataTransport from "../interfaces/DataTransport"
import DataAudioTransport from "../interfaces/DataAudioTransport"
import DataAudioVideoTransport from "../interfaces/DataAudioVideoTransport"

export type TransportAlias = DataTransport | DataAudioTransport | DataAudioVideoTransport

export default TransportAlias
