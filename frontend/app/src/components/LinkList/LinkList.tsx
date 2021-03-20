import { List } from '@material-ui/core';
import React from 'react';
import ListItemLink, { ListItemLinkProps } from '../ListItem';

export interface LinkListProps {
  list: ListItemLinkProps[];
}

export const LinkList: React.FC<LinkListProps> = ({ list }) => {
  return (
    <List>
      {list.map((item, index) => {
        return <ListItemLink {...item} key={`${item.to}-${index}`} />;
      })}
    </List>
  );
};
