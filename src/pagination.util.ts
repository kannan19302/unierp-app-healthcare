
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
}

/**
 * Build pagination skip/take values.
 */
export function buildPaginationValues(params: PaginationParams): {
    skip: number;
    take: number;
} {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;
    return { skip, take: limit };
}

/**
 * Build Prisma orderBy from sort param string.
 * Handles multi-field sorting (e.g., "name,-createdAt").
 * Returns a generic array that can be cast to the specific model's type.
 */
export function buildOrderBy(sort?: string): Record<string, 'asc' | 'desc'>[] {
    if (!sort) return [{ createdAt: 'desc' }];
    const fields = sort.split(',');
    return fields.map((field) => {
        const desc = field.startsWith('-');
        const key = desc ? field.substring(1) : field;
        return { [key]: desc ? 'desc' : 'asc' };
    });
}

/**
 * Wrap data with pagination meta.
 */
export function paginatedResult<T>(
    data: T[],
    total: number,
    params: PaginationParams,
): PaginatedResult<T> {
    const page = params.page || 1;
    const limit = params.limit || 25;
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
