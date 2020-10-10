// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import * as Avatar from 'react-avatar';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Graphviz } from 'graphviz-react';
import AppConfig from 'config/config';
import { TableReader } from 'interfaces';
import { logClick } from 'ducks/utilMethods';

export interface UpstreamDownstreamLinkProps {
  uris: string[];
}

export function renderUpstreamDownstreamLink(
  uri: string,
  index: number,
  uris: string[]
) {

  const config = AppConfig.upstreamDownstreamLink;
  // postgres://training_db.public/data_set_examples
  let parts = uri.split("/");
  let cluster = parts[2].split(".")[0]
  let database = parts[0].split(":")[0]
  let schema = parts[2].split(".")[1]
  let table = parts[3]
  const href = config.urlGenerator(database, cluster, schema, table);
  let img_src = '/static/images/' + cluster + '.' + schema + '.' + table + '.gv.png'
  return (
    <div>
      <a
        href={href}
        target="_blank"
        id={uri}
        rel="noreferrer"
      >
        {uri}
      </a>
      <img src={img_src}/>
     </div>
  );
}

const UpstreamDownstreamLink: React.FC<UpstreamDownstreamLinkProps> = ({
  uris,
}: UpstreamDownstreamLinkProps) => {
  if (uris.length === 0) {
    return <label className="body-3">No tables in direct lineage</label>;
  }

  return <div>{uris.map(renderUpstreamDownstreamLink)}</div>;
};

export default UpstreamDownstreamLink;
