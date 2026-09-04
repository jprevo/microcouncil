import type { Environment, Member } from "../types";

/** CLDR-lite plural rule: enough categories for the locales this app ships today. */
export interface PluralForms {
  readonly one: string;
  readonly other: string;
}

/** The same, with an explicit phrasing for "none yet" instead of a bare count of 0. */
export interface ZeroPluralForms extends PluralForms {
  readonly zero: string;
}

export interface LocaleMeta {
  readonly code: string;
  readonly label: string;
  readonly htmlLang: string;
  readonly dir: "ltr" | "rtl";
  readonly title: string;
  readonly description: string;
  readonly ogLocale: string;
  /** BCP 47 tag used for both `Intl.NumberFormat` and `Intl.DateTimeFormat`. */
  readonly numberLocale: string;
  /** Stand-in for `{{username}}` when nothing was typed. */
  readonly usernameFallback: string;
  /** How the template token reads in on-screen summaries, e.g. "you" / "vous". */
  readonly youWord: string;
  /** Rough characters-per-token, for the token estimate shown under the prompt. */
  readonly charsPerToken: number;
}

export interface UiStrings {
  readonly brand: string;
  readonly lede: string;
  readonly prompt: {
    readonly noMembers: string;
    readonly noEnvironment: string;
    readonly personalityLabel: string;
  };
  readonly footer: {
    readonly license: string;
    readonly githubLinkText: string;
    readonly privacy: string;
  };
  readonly theme: {
    readonly toDark: string;
    readonly toLight: string;
  };
  readonly topbar: {
    readonly save: string;
    readonly saveAria: string;
    readonly load: string;
    readonly loadAria: string;
    readonly loadAriaWithCount: string;
  };
  readonly identity: {
    readonly title: string;
    readonly placeholder: string;
  };
  readonly members: {
    readonly title: string;
    readonly hint: string;
    readonly clearAll: string;
    readonly filterPlaceholder: string;
    readonly filterAriaLabel: string;
    readonly empty: string;
    readonly add: string;
    readonly selectedCount: PluralForms;
    readonly edit: string;
    readonly editorCreateTitle: string;
    readonly toastCreated: string;
    readonly toastUpdated: string;
    readonly fields: {
      readonly name: string;
      readonly namePlaceholder: string;
      readonly job: string;
      readonly jobPlaceholder: string;
      readonly description: string;
      readonly descriptionHint: string;
      readonly descriptionPlaceholder: string;
      readonly traits: string;
      readonly traitsHint: string;
      readonly traitsPlaceholder: string;
      readonly tags: string;
      readonly tagsHint: string;
      readonly tagsPlaceholder: string;
    };
    readonly validation: {
      readonly nameRequired: string;
      readonly nameTaken: string;
      readonly iconRequired: string;
      readonly jobRequired: string;
      readonly descriptionRequired: string;
    };
  };
  readonly environments: {
    readonly title: string;
    readonly hint: string;
    readonly clear: string;
    readonly add: string;
    readonly edit: string;
    readonly editorCreateTitle: string;
    readonly toastCreated: string;
    readonly toastUpdated: string;
    readonly fields: {
      readonly title: string;
      readonly titlePlaceholder: string;
      readonly summary: string;
      readonly summaryHint: string;
      readonly summaryPlaceholder: string;
      readonly description: string;
      readonly descriptionHint: string;
      readonly descriptionPlaceholder: string;
    };
    readonly validation: {
      readonly titleRequired: string;
      readonly titleTaken: string;
      readonly iconRequired: string;
      readonly summaryRequired: string;
      readonly descriptionRequired: string;
    };
  };
  readonly icon: {
    readonly label: string;
  };
  readonly emojiPicker: {
    readonly searchPlaceholder: string;
    readonly empty: string;
    readonly gridLabel: string;
    readonly loading: string;
    readonly loadFailed: string;
  };
  readonly editor: {
    readonly close: string;
    readonly deleteConfirm: string;
    readonly deleted: string;
    readonly restore: string;
    readonly restored: string;
    readonly delete: string;
    readonly cancel: string;
    readonly save: string;
  };
  readonly custom: {
    readonly title: string;
    readonly hint: string;
    readonly example: string;
    readonly clear: string;
    readonly placeholder: string;
  };
  readonly subject: {
    readonly title: string;
    readonly optional: string;
    readonly hint: string;
    readonly clear: string;
    readonly placeholder: string;
  };
  readonly output: {
    readonly title: string;
    readonly meta: string;
    readonly warningMissing: string;
    readonly missingMembers: string;
    readonly missingEnvironment: string;
    readonly missingUsername: string;
    readonly note: string;
    readonly copy: string;
    readonly copied: string;
    readonly copiedToast: string;
    readonly download: string;
    readonly downloadedToast: string;
  };
  readonly saves: {
    readonly title: string;
    readonly empty: string;
    readonly membersCount: PluralForms;
    readonly deleteAria: string;
    readonly deleteConfirm: string;
    readonly loadedToast: string;
    readonly deletedToast: string;
    readonly dialogTitle: string;
    readonly nameLabel: string;
    readonly nameHint: string;
    readonly namePlaceholder: string;
    readonly nameRequired: string;
    readonly replaceConfirm: string;
    readonly maxReached: string;
    readonly savedToast: string;
    readonly suggestedNamePrefix: string;
  };
  readonly backup: {
    readonly cardsWord: PluralForms;
    readonly savesWord: PluralForms;
    readonly export: {
      readonly button: string;
      readonly buttonAria: string;
      readonly title: string;
      readonly confirmLabel: string;
      readonly intro: string;
      readonly sectionTitle: string;
      readonly settingsLine: string;
      readonly cardsLine: ZeroPluralForms;
      readonly savesLine: ZeroPluralForms;
      readonly downloadedToast: string;
    };
    readonly import: {
      readonly button: string;
      readonly buttonAria: string;
      readonly title: string;
      readonly confirmLabel: string;
      readonly intro: string;
      readonly sectionTitle: string;
      readonly exportedAtUnknown: string;
      readonly exportedAt: string;
      readonly cardsSavesLine: string;
      readonly settingsLine: string;
      readonly warningTitle: string;
      readonly warning: string;
      readonly restoredToast: string;
      readonly localeMismatch: string;
    };
    readonly errors: {
      readonly unreadableJson: string;
      readonly notABackup: string;
      readonly noVersion: string;
      readonly versionTooNew: string;
      readonly versionUnsupported: string;
      readonly noState: string;
      readonly noSaves: string;
      readonly fileUnreadable: string;
    };
  };
  readonly skill: {
    readonly button: string;
    readonly title: string;
    readonly intro: string;
    readonly overviewTitle: string;
    readonly overviewBullet1: string;
    readonly overviewBullet2: string;
    readonly overviewBullet3: string;
    readonly hermesTitle: string;
    readonly hermesChatIntro: string;
    readonly installCommand: string;
    readonly hermesCliIntro: string;
    readonly hermesCliCommand: string;
    readonly claudeCodeTitle: string;
    readonly claudeCodeChatIntro: string;
    readonly claudeInstallCommand: string;
    readonly claudeCodeInvokeIntro: string;
    readonly claudeCodeCommand: string;
    readonly note: string;
  };
  readonly tiles: {
    readonly added: string;
    readonly modified: string;
  };
  readonly misc: {
    readonly copyFailed: string;
    readonly commandCopiedToast: string;
    readonly commandCopiedAria: string;
    readonly commandCopyAria: string;
  };
}

/** Everything a page needs, sourced entirely from one language's directory. */
export interface LocaleBundle {
  readonly meta: LocaleMeta;
  readonly ui: UiStrings;
  readonly members: readonly (Member & { readonly id: string })[];
  readonly environments: readonly (Environment & { readonly id: string })[];
  readonly promptTemplate: string;
  readonly customExample: string;
}
