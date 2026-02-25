import { forwardRef } from 'react';
import trashcanIcon from '../assets/images/TrashcanIcon.svg';
import '../styles/TrashcanBox.css';

const TrashcanBox = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <div className="trashcan-box" title="Drop monsters here to delete" ref={ref}>
            <div className="trashcan-icon-wrapper">
                <img src={trashcanIcon} alt="Trashcan" className="trashcan-icon" />
            </div>
        </div>
    );
});

export default TrashcanBox;