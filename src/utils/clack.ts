import * as p from "@clack/prompts";

/**
 * A wrapper around clack that provides a simpler API
 */
export default {
  intro: p.intro,
  outro: p.outro,
  log: {
    info: (message: string) => p.log.info(message),
    success: (message: string) => p.log.success(message),
    error: (message: string) => p.log.error(message),
    warn: (message: string) => p.log.warn(message),
  },
  text: async (options: p.TextOptions) => {
    return (await p.text(options)) as string;
  },
  select: async (options: any) => {
    const result = await p.select(options as any);
    return result as any;
  },
  confirm: async (options: p.ConfirmOptions) => {
    const result = await p.confirm(options);
    return !!result;
  },
  spinner: () => p.spinner(),
  cancel: p.cancel,
  note: p.note,
  isCancel: p.isCancel,
};
