// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { OpenRequestAction } from 'ducks/notification/types';

import EditableSection from 'components/common/EditableSection';
import Table, {
  TableColumn as ReusableTableColumn,
  TextAlignmentValues,
} from 'components/common/Table';

import { logAction } from 'ducks/utilMethods';
import {
  notificationsEnabled,
  getMaxLength,
  getTableSortCriterias,
} from 'config/config-utils';

import {
  TableColumn,
  RequestMetadataType,
  SortCriteria,
  SortDirection,
} from 'interfaces';

import ColumnType from './ColumnType';
import ColumnDescEditableText from './ColumnDescEditableText';
import { getStatsInfoText } from './utils';

import {
  MORE_BUTTON_TEXT,
  REQUEST_DESCRIPTION_TEXT,
  EMPTY_MESSAGE,
  EDITABLE_SECTION_TITLE,
  COLUMN_STATS_TITLE,
} from './constants';

import './styles.scss';

export interface ColumnListProps {
  columns: TableColumn[];
  openRequestDescriptionDialog: (
    requestMetadataType: RequestMetadataType,
    columnName: string
  ) => OpenRequestAction;
  database: string;
  editText?: string;
  editUrl?: string;
  sortBy?: SortCriteria;
}

type ContentType = {
  title: string;
  description: string;
};

type DatatypeType = {
  name: string;
  database: string;
  type: string;
};

type StatType = {
  end_epoch: number;
  start_epoch: number;
  stat_type: string;
  stat_val: string;
};

type FormattedDataType = {
  content: ContentType;
  type: DatatypeType;
  usage: number | null;
  stats: StatType | null;
  action: string;
  editText: string | null;
  editUrl: string | null;
  index: number;
  name: string;
  sort_order: string;
  isEditable: boolean;
};

type ExpandedRowProps = {
  rowValue: FormattedDataType;
  index: number;
};

// TODO: Move this into the configuration once we have more info about the rest of stats
const USAGE_STAT_TYPE = 'column_usage';
const SHOW_STATS_THRESHOLD = 1;
const DEFAULT_SORTING: SortCriteria = {
  name: 'Table Default',
  key: 'sort_order',
  direction: SortDirection.ascending,
};

const getSortingFunction = (
  formattedData: FormattedDataType[],
  sortBy: SortCriteria
) => {
  const numberSortingFunction = (a, b) => {
    return b[sortBy.key] - a[sortBy.key];
  };

  const stringSortingFunction = (a, b) => {
    if (a[sortBy.key] && b[sortBy.key]) {
      return a[sortBy.key].localeCompare(b[sortBy.key]);
    }
    return null;
  };

  if (!formattedData.length) {
    return numberSortingFunction;
  }

  return Number.isInteger(formattedData[0][sortBy.key])
    ? numberSortingFunction
    : stringSortingFunction;
};

const getUsageStat = (item) => {
  const hasItemStats = !!item.stats.length;

  if (hasItemStats) {
    const usageStat = item.stats.find((s) => {
      return s.stat_type === USAGE_STAT_TYPE;
    });

    return usageStat ? +usageStat.stat_val : null;
  }

  return null;
};

const handleRowExpand = (rowValues) => {
  logAction({
    command: 'click',
    label: `${rowValues.content.title} ${rowValues.type.type}`,
    target_id: `column::${rowValues.content.title}`,
    target_type: 'column stats',
  });
};

// @ts-ignore
const ExpandedRowComponent: React.FC<ExpandedRowProps> = (
  rowValue: FormattedDataType
) => {
  const shouldRenderDescription = () => {
    const { content, editText, editUrl, isEditable } = rowValue;

    if (content.description) {
      return true;
    }
    if (!editText && !editUrl && !isEditable) {
      return false;
    }

    return true;
  };

  return (
    <div className="expanded-row-container">
      {shouldRenderDescription() && (
        <EditableSection
          title={EDITABLE_SECTION_TITLE}
          readOnly={!rowValue.isEditable}
          editText={rowValue.editText || undefined}
          editUrl={rowValue.editUrl || undefined}
        >
          <ColumnDescEditableText
            columnIndex={rowValue.index}
            editable={rowValue.isEditable}
            maxLength={getMaxLength('columnDescLength')}
            value={rowValue.content.description}
          />
        </EditableSection>
      )}
      {rowValue.stats && (
        <div className="stat-collection-info">
          <span className="stat-title">{COLUMN_STATS_TITLE} </span>
          {getStatsInfoText(
            rowValue.stats.start_epoch,
            rowValue.stats.end_epoch
          )}
        </div>
      )}
    </div>
  );
};

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  database,
  editText,
  editUrl,
  openRequestDescriptionDialog,
  sortBy = DEFAULT_SORTING,
}: ColumnListProps) => {
  const formattedData: FormattedDataType[] = columns.map((item, index) => {
    const hasItemStats = !!item.stats.length;

    return {
      content: {
        title: item.name,
        description: item.description,
      },
      type: {
        type: item.col_type,
        name: item.name,
        database,
      },
      sort_order: item.sort_order,
      usage: getUsageStat(item),
      stats: hasItemStats ? item.stats[0] : null,
      action: item.name,
      name: item.name,
      isEditable: item.is_editable,
      editText: editText || null,
      editUrl: editUrl || null,
      index,
    };
  });
  const statsCount = formattedData.filter((item) => !!item.stats).length;
  const hasUsageStat =
    getTableSortCriterias().usage && statsCount >= SHOW_STATS_THRESHOLD;
  let formattedAndOrderedData = formattedData.sort(
    getSortingFunction(formattedData, sortBy)
  );
  if (sortBy.direction === SortDirection.ascending) {
    formattedAndOrderedData = formattedAndOrderedData.reverse();
  }

  let formattedColumns: ReusableTableColumn[] = [
    {
      title: 'Name',
      field: 'content',
      component: ({ title, description }: ContentType) => (
        <>
          <div className="column-name">{title}</div>
          <div className="column-desc truncated">{description}</div>
        </>
      ),
    },
    {
      title: 'Type',
      field: 'type',
      component: (type) => (
        <div className="resource-type">
          <ColumnType
            type={type.type}
            database={type.database}
            columnName={type.name}
          />
        </div>
      ),
    },
  ];

  if (hasUsageStat) {
    formattedColumns = [
      ...formattedColumns,
      {
        title: 'Usage',
        field: 'usage',
        horAlign: TextAlignmentValues.right,
        component: (usage) => (
          <p className="resource-type usage-value">{usage}</p>
        ),
      },
    ];
  }

  if (notificationsEnabled()) {
    formattedColumns = [
      ...formattedColumns,
      {
        title: '',
        field: 'action',
        width: 80,
        horAlign: TextAlignmentValues.right,
        component: (name, index) => (
          <div className="actions">
            <Dropdown
              id={`detail-list-item-dropdown:${index}`}
              pullRight
              className="column-dropdown"
            >
              <Dropdown.Toggle noCaret>
                <span className="sr-only">{MORE_BUTTON_TEXT}</span>
                <img className="icon icon-more" alt="" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem
                  onClick={() => {
                    openRequestDescriptionDialog(
                      RequestMetadataType.COLUMN_DESCRIPTION,
                      name
                    );
                  }}
                >
                  {REQUEST_DESCRIPTION_TEXT}
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ),
      },
    ];
  }

  return (
    <Table
      columns={formattedColumns}
      data={formattedAndOrderedData}
      options={{
        rowHeight: 72,
        emptyMessage: EMPTY_MESSAGE,
        expandRow: ExpandedRowComponent,
        onExpand: handleRowExpand,
        tableClassName: 'table-detail-table',
      }}
    />
  );
};

export default ColumnList;
