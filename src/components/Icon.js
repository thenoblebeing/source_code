import React from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiMinus,
  FiCheck,
  FiX,
  FiTrash2,
  FiShoppingBag,
  FiCamera,
  FiSearch,
  FiRotateCw,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiCreditCard,
  FiTruck,
  FiRefreshCw,
  FiLock,
  FiMapPin,
  FiInfo,
  FiChevronRight,
  FiChevronLeft,
  FiPhone,
  FiMail,
  FiCalendar,
  FiStar,
  FiHeart,
  FiShield,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
  FiPackage,
  FiTrendingUp
} from 'react-icons/fi';

// Styled wrapper to maintain consistent styling
const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || 'currentColor'};
  width: ${props => props.size || '1em'};
  height: ${props => props.size || '1em'};
  
  & > svg {
    width: 100%;
    height: 100%;
  }
`;

// Icon component that maps icon names to react-icons components
const Icon = ({ name, size, color, ...props }) => {
  // Map of icon names to react-icons components
  const iconMap = {
    // Basic UI icons
    plus: FiPlus,
    minus: FiMinus,
    check: FiCheck,
    'check-circle': FiCheckCircle,
    x: FiX,
    trash: FiTrash2,
    
    // Commerce icons
    bag: FiShoppingBag,
    'shopping-bag': FiShoppingBag,
    shoppingBag: FiShoppingBag,
    'credit-card': FiCreditCard,
    
    // Media icons
    camera: FiCamera,
    
    // Navigation icons
    search: FiSearch,
    user: FiUser,
    
    // Utility icons
    'rotate-cw': FiRotateCw,
    rotateCw: FiRotateCw,
    'refresh-cw': FiRefreshCw,
    'alert-circle': FiAlertCircle,
    alertCircle: FiAlertCircle,
    
    // Shipping and checkout
    truck: FiTruck,
    lock: FiLock,
    'map-pin': FiMapPin,
    
    // Additional icons
    info: FiInfo,
    'chevron-right': FiChevronRight,
    'chevron-left': FiChevronLeft,
    phone: FiPhone,
    mail: FiMail,
    calendar: FiCalendar,
    star: FiStar,
    heart: FiHeart,
    shield: FiShield,
    
    // Extended icons
    'zoom-in': FiZoomIn,
    zoomIn: FiZoomIn,
    'zoom-out': FiZoomOut,
    zoomOut: FiZoomOut,
    download: FiDownload,
    package: FiPackage,
    'trending-up': FiTrendingUp,
    trendingUp: FiTrendingUp
  };

  // Get the icon component from the map or use FiInfo as fallback
  const IconComponent = iconMap[name] || FiInfo;

  return (
    <IconWrapper size={size} color={color} {...props}>
      <IconComponent />
    </IconWrapper>
  );
};

export default Icon;
