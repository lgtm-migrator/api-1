// Copyright 2017-2022 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { HeaderExtended } from '../type/types';
import type { DeriveApi } from '../types';

import { combineLatest, map, of, switchMap } from 'rxjs';

import { createHeaderExtended } from '../type';
import { memo } from '../util';
import { getAuthorDetails } from './util';

/**
 * @name subscribeNewHeads
 * @returns A header with the current header (including extracted author)
 * @description An observable of the current block header and it's author
 * @example
 * <BR>
 *
 * ```javascript
 * api.derive.chain.subscribeNewHeads((header) => {
 *   console.log(`block #${header.number} was authored by ${header.author}`);
 * });
 * ```
 */
export function subscribeNewHeads (instanceId: string, api: DeriveApi): () => Observable<HeaderExtended> {
  return memo(instanceId, (): Observable<HeaderExtended> =>
    api.rpc.chain.subscribeNewHeads().pipe(
      switchMap((header) =>
        combineLatest([
          of(header),
          api.queryAt(header.hash)
        ])
      ),
      switchMap(([header, queryAt]) =>
        getAuthorDetails(header, queryAt)
      ),
      map(([header, validators, author]): HeaderExtended => {
        header.createdAtHash = header.hash;

        return createHeaderExtended(header.registry, header, validators, author);
      })
    )
  );
}
