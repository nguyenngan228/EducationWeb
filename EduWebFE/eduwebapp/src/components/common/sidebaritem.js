import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  transition: background-color 0.3s, color 0.3s;
  text-decoration: none;
  background-color: ${props => props.active ? 'rgba(14, 165, 233, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#0ea5e9' : '#64748b'}; 

  &:hover {
    background-color: #e2e8f0; 
    color: #0ea5e9;

    .icon {
      color: #0ea5e9;
    }
  }

  ${props => props.active && css`
    background-color: rgba(14, 165, 233, 0.2); 
    color: #0ea5e9;

    .icon {
      color: #0ea5e9;
    }
  `}
`;

const IconWrapper = styled.div`
  color: ${props => props.active ? '#0ea5e9' : '#64748b'}; 
  transition: color 0.3s;

  .icon {
    color: inherit;
  }
`;

export const SidebarItem = ({ icon: Icon, label, href }) => {
    const { pathname } = useLocation();
    const isActive =  pathname.includes(href)

    return (
        <StyledLink to={href} active={isActive}>
            <IconWrapper active={isActive}>
                <Icon size={22} className="icon" />
            </IconWrapper>
            {label}
        </StyledLink>
    );
}

SidebarItem.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
};
