// src/tooltips.ts
export interface TooltipEntry {
  title?: string; // Optional title, can be overridden by component prop
  content: string; // Markdown content
}

export interface Tooltips {
  [key: string]: TooltipEntry;
}

export const tooltips: Tooltips = {
  'action-replay': {
    content: `
[Action Replay](https://en.wikipedia.org/wiki/Action_Replay) is a brand of cheat device.
* Allows entering codes.
* Can unlock secret characters or levels.
* Modifies game memory.
    `,
  },
  'gameshark': {
    content: `
[GameShark](https://en.wikipedia.org/wiki/GameShark) is another popular brand of cheat device.
* Often uses similar code formats to Action Replay.
* Can unlock secret characters or levels.
* Cartridges also acted as memory cards, with equal or greater storage capacity to the consoles' first party memory cards.
    `,
  },
};
