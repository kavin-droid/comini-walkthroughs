import type { Direction, Session, StepSize } from "./types";

/** The running sequence of landed values, e.g. startVal=14, step=2, dir=1, jumps=5 -> [14,16,18,20,22,24]. */
export function buildSequence(startVal: number, step: StepSize, dir: Direction, jumps: number): number[] {
  const seq = [startVal];
  for (let i = 1; i <= jumps; i++) seq.push(seq[i - 1] + dir * step);
  return seq;
}

export function sessionSequence(session: Session): number[] {
  return buildSequence(session.startVal, session.step, session.dir, session.jumps);
}

export function sequenceEnd(session: Session): number {
  const seq = sessionSequence(session);
  return seq[seq.length - 1];
}

export function actionWord(dir: Direction): string {
  return dir === 1 ? "skip count" : "count back";
}

export function opSymbol(dir: Direction): string {
  return dir === 1 ? "+" : "−";
}
