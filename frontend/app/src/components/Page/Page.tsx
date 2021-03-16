import React from 'react';
import { Container, IconButton } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet-async';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE } from '../../i18n';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { Header } from '../Header';
import { Typography } from '../Typography';
import { OvenStats } from '../OvenStats/OvenStats';

const ContainerStyled = styled(Container)`
  padding-top: 1em;
`;

export interface PageProps {
  title?: string;
  showBackButton?: boolean;
  description?: string;
  showStats?: boolean;
}

interface PageLocationStateParams {
  backPath?: string;
}

export const Page: React.FC<PageProps> = ({ title, children, description, showStats = false }) => {
  const { state } = useLocation<PageLocationStateParams>();
  const history = useHistory();
  const { i18n } = useTranslation();
  const lang = i18n.language || window.localStorage.i18nextLng || DEFAULT_LANGUAGE;
  const pageTitle = title ? `${title} - ${APP_NAME} - ${NETWORK}` : `${APP_NAME} - ${NETWORK}`;
  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <Header title={APP_NAME} onClick={() => history.push('/')} />
      <Container disableGutters>{showStats && <OvenStats />}</Container>
      {title && (
        <ContainerStyled>
          <IconButton
            onClick={() => {
              state?.backPath ? history.push(state.backPath) : history.goBack();
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography size="2rem" component="h1">
            {title}
          </Typography>
        </ContainerStyled>
      )}
      <ContainerStyled>{children}</ContainerStyled>
    </>
  );
};
