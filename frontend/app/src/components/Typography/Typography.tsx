import styled from '@emotion/styled';
import {
  Typography as MaterialTypography,
  TypographyProps as MaterialTypographyProps,
} from '@material-ui/core';

export interface TypographyProps extends Omit<MaterialTypographyProps, 'variant'> {
  size?: MaterialTypographyProps['variant'] | string;
  margin?: string;
  component?: unknown; // TODO: extract from material-ui props
}

interface IStyledTypography {
  margin?: string;
}

const StyledTypography = styled(MaterialTypography)<IStyledTypography>`
  font-size: ${({ fontSize }) => fontSize};
  margin: ${({ margin }) => margin};
`;

export const Typography: React.FC<TypographyProps> = ({ size, children, ...rest }) => {
  const fontSize = size && (size.includes('em') || size.includes('px')) ? size : undefined;
  const variant = (size && !fontSize ? size : 'body1') as MaterialTypographyProps['variant'];
  return (
    <StyledTypography fontSize={fontSize} variant={variant} {...rest}>
      {children}
    </StyledTypography>
  );
};
