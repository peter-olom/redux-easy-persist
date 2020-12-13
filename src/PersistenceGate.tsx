// import React from 'react';

interface PersistenceGateProps {
	children: JSX.Element;
	loader: JSX.Element | undefined;
}
const PersistenceGate = ({ children, loader }: PersistenceGateProps): JSX.Element => {
	return loader == undefined ? <></> : children;
};

export default PersistenceGate;
