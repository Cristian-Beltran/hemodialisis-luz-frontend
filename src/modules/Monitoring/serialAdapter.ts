// src/lib/serialAdapter.ts
import type { SerialPort } from "./serial.interface"; // asegúrate de esta ruta

export type LineReader = ReadableStreamDefaultReader<string>;
export type LineWriter = WritableStreamDefaultWriter<string>;

export interface SerialIO {
  reader: LineReader;
  writer: LineWriter;
  close: () => Promise<void>;
}

export function isWebSerialSupported(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

export async function getAuthorizedPorts(): Promise<SerialPort[]> {
  if (!isWebSerialSupported()) return [];
  return navigator.serial.getPorts();
}

export async function requestPort(
  filters?: Array<{ usbVendorId?: number; usbProductId?: number }>,
): Promise<SerialPort> {
  if (!isWebSerialSupported()) {
    throw new Error("Web Serial no está disponible. Use Chrome/Edge en HTTPS.");
  }
  return navigator.serial.requestPort(filters ? { filters } : undefined);
}

/** Splitter con “carry”: no emite la última línea si está incompleta */
class LineBreakTransformer implements Transformer<string, string> {
  private carry = "";

  transform(
    chunk: string,
    controller: TransformStreamDefaultController<string>,
  ) {
    this.carry += chunk;
    const lines = this.carry.split(/\r?\n/);
    // El último elemento puede estar incompleto: lo guardamos en carry
    this.carry = lines.pop() ?? "";
    for (const line of lines) {
      if (line.length) controller.enqueue(line);
    }
  }

  flush(_controller: TransformStreamDefaultController<string>) {
    // No emitimos carry para evitar JSON cortado
    console.log(_controller);
    this.carry = "";
  }
}

/**
 * Abre el puerto y devuelve IO por líneas (reader) + writer de string.
 * Solo se leen líneas completas; nunca trozos.
 */
export async function openPort(
  port: SerialPort,
  baudRate = 115200,
): Promise<SerialIO> {
  await port.open({ baudRate });

  // Decoder: Uint8Array -> string
  const textDecoder = new TextDecoderStream();
  const readableClosed = port.readable?.pipeTo(textDecoder.writable);
  if (!readableClosed) throw new Error("El puerto no es legible.");

  // Encoder: string -> Uint8Array
  const textEncoder = new TextEncoderStream();
  const writableClosed = textEncoder.readable.pipeTo(
    port.writable as WritableStream<Uint8Array>,
  );
  if (!writableClosed) throw new Error("El puerto no es escribible.");

  // Reader de LÍNEAS completas (NDJSON)
  const reader = textDecoder.readable
    .pipeThrough(
      new TransformStream<string, string>(new LineBreakTransformer()),
    )
    .getReader();

  // Writer de STRING (el encoder convierte a bytes)
  const writer = textEncoder.writable.getWriter();

  const close = async () => {
    try {
      writer.releaseLock();
    } catch {
      console.error("error");
    }
    try {
      await reader.cancel();
    } catch {
      console.error("error");
    }
    try {
      await port.close();
    } catch {
      console.error("error");
    }
    try {
      await readableClosed;
    } catch {
      console.error("error");
    }
    try {
      await writableClosed;
    } catch {
      console.error("error");
    }
  };

  return { reader, writer, close };
}

/** Escribe una línea (agrega '\n' si falta) */
export async function writeLine(
  writer: LineWriter,
  line: string,
): Promise<void> {
  await writer.write(line.endsWith("\n") ? line : `${line}\n`);
}
