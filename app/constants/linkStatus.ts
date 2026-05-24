
export const LinkStatus = {
    DRAFT:       0,
    PUBLISHED:   1,
    UNPUBLISHED: 2,
} as const;

export type LinkStatusValue = typeof LinkStatus[keyof typeof LinkStatus]; 