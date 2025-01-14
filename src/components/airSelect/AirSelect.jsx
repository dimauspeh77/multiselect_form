import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BiSolidDownArrow } from 'react-icons/bi'
import { useMediaQuery } from '../../method/useMediaQuery'
import AirFiltered from './AirFiltered'
import { useAirportSelectStore, useResortsStore } from '../../store/store'
import { getData } from '../../method/fn'

import styles from './airSelect.module.css'

const AirSelect = () => {
	const [selectedAir, setSelectedAir] = useState(null)
	const [filteredAir, setFilteredAir] = useState(null)
	const [showAir, setShowAir] = useState(false)
	const [isAirMobile, setIsAirMobile] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const {
		airports,
		airValue,
		setAirports,
		setAirValue,
		filterAirportsByCountry,
		searchAirports,
		chooseAirport,
		placeholder,
		setUniqueAirports,
		setPlaceholder
	} = useAirportSelectStore()
	const { selectedCountry } = useResortsStore()
	const isMobileShow = useMediaQuery('(max-width: 768px)')
	const airRef = useRef(null)

	useEffect(() => {
		setIsLoading(true)
		getData('/fakeairport.json')
			.then(data => {
				setAirports(data.airports)
				setUniqueAirports(data.airports)
				setIsLoading(false)
			})
			.catch(error => {
				setIsLoading(false)
				console.error('Error fetching data:', error)
			})
	}, [setAirports, setUniqueAirports])

	useEffect(() => {
		if (!selectedCountry || !airports.length) return
		if (selectedCountry && airports) {
			const airport = airports.filter(air => {
				return air.country === selectedCountry
			})
			setPlaceholder(airport[0].name)
		}
	}, [airports, selectedCountry, setPlaceholder])

	useEffect(() => {
		if (airports.length > 0) {
			setSelectedAir(airports[0].id)
		}
	}, [airports])

	const handleAirInputClick = () => {
		const filteredAir = filterAirportsByCountry()
		setFilteredAir(filteredAir)
		setSelectedAir(filteredAir[0].id)
		setAirValue('')
		if (isMobileShow) {
			setIsAirMobile(true)
			setShowAir(true)
		} else {
			setIsAirMobile(false)
			setShowAir(!showAir)
		}
	}

	const handleAirChange = e => {
		const value = e.target.value
		setAirValue(value)
		const searchResults = searchAirports(value)
		setFilteredAir(searchResults)
	}

	const chooseAir = value => {
		const selectedAir = airports.find(air => air.name === value)
		chooseAirport(value)
		setShowAir(false)
		setIsAirMobile(false)
		setSelectedAir(selectedAir.id)
	}

	const handleOutsideClickAir = useCallback(
		event => {
			if (airRef.current && !airRef.current.contains(event.target)) {
				setShowAir(false)
				setAirValue('')
			}
		},
		[setAirValue]
	)

	useEffect(() => {
		if (showAir) {
			document.addEventListener('click', handleOutsideClickAir)
		} else {
			document.removeEventListener('click', handleOutsideClickAir)
		}

		return () => {
			document.removeEventListener('click', handleOutsideClickAir)
		}
	}, [handleOutsideClickAir, showAir])

	return (
		<>
			<div className={styles.wrapperDiv} ref={airRef}>
				<div className={styles.formField}>
					<input
						className={styles.searchAir}
						type="search"
						placeholder={placeholder}
						value={airValue}
						onChange={handleAirChange}
						onClick={handleAirInputClick}
					/>
					<BiSolidDownArrow className={styles.formIcon} onClick={handleAirInputClick} />
				</div>
				{showAir && !isMobileShow && airports.length > 0 && (
					<div className={styles.formList}>
						<div className={styles.searchList}>
							<AirFiltered
								selectedAir={selectedAir}
								filteredAir={filteredAir}
								chooseAir={chooseAir}
								isLoading={isLoading}
							/>
						</div>
					</div>
				)}
				{isAirMobile && isMobileShow && airports.length > 0 && (
					<div className={styles.wrapperDivModal}>
						<div className={styles.wrapperHeaderModal}>
							<div className={styles.modalHeader}>
								<span style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setIsAirMobile(!isAirMobile)}>
									X
								</span>
							</div>
							<div className={styles.blockSearchModal}>
								<div className={styles.formFieldModal}>
									<input
										className={styles.searchAir}
										type="search"
										placeholder={placeholder}
										value={airValue}
										onChange={handleAirChange}
										onClick={handleAirInputClick}
									/>
									<div className={styles.cnt} onClick={handleAirInputClick}></div>
								</div>
							</div>
						</div>

						{showAir && (
							<div className={styles.formListMobile}>
								<div className={styles.searchListModal}>
									<AirFiltered
										selectedAir={selectedAir}
										filteredAir={filteredAir}
										chooseAir={chooseAir}
										isLoading={isLoading}
									/>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</>
	)
}

export default AirSelect
