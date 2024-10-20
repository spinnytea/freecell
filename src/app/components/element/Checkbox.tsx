import { ChangeEvent } from 'react';
import styles_element from '@/app/components/element/element.module.css';

export function Checkbox({
	name,
	value,
	text,
	onChange,
}: Readonly<{
	name: string;
	value: boolean;
	text: string;
	onChange: (newChecked: boolean) => void;
}>) {
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		event.stopPropagation();
		onChange(event.target.checked);
	}

	return (
		<label className={styles_element.checkbox} htmlFor={name}>
			<input type="checkbox" id={name} name={name} defaultChecked={value} onChange={handleChange} />
			<span>{text}</span>
		</label>
	);
}
