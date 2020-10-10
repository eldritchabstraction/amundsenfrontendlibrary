// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import AvatarLabel from 'components/common/AvatarLabel';
import AppConfig from 'config/config';
import { logClick } from 'ducks/utilMethods';
import { TableMetadata } from 'interfaces/TableMetadata';

export interface LineageGraphProps {
  tableData: TableMetadata;
}

const LineageGraph: React.FC<LineageGraphProps> = ({
  tableData,
}: LineageGraphProps) => {
  const { database, cluster, schema, name } = tableData;
  const href = 'http://localhost:5000/static/images/graph/' + cluster + '.' + schema + '.' + name + '.gv.png'
  if (!href) return null;

  const label = 'Lineage Graph';
  let iconPath = 'PATH_TO_ICON';
  return (
    <a
      className="header-link"
      href={href}
      target="_blank"
      id="explore-lineage"
      onClick={logClick}
      rel="noreferrer"
    >
      <AvatarLabel label={label} src={iconPath} />
    </a>
  );
};

export default LineageGraph;
