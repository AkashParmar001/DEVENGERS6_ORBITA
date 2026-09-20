-- ORBITA Seed Data Migration
-- SYNTHETIC/DEMO DATA - Not real space objects
-- This data is for development and testing purposes only

-- ============================================================
-- 20 SYNTHETIC SATELLITES
-- ============================================================
INSERT INTO space_objects (id, name, object_type, status, mass_kg, dimensions_m, launch_date, operator, country, orbit_type) VALUES
('a0000001-0000-0000-0000-000000000001', 'SYNTH-SAT-001', 'SATELLITE', 'active', 500.000, '{"length": 3.2, "width": 1.8, "height": 2.1}', '2020-01-15', 'SynthSpace Corp', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000002', 'SYNTH-SAT-002', 'SATELLITE', 'active', 750.500, '{"length": 4.5, "width": 2.3, "height": 3.0}', '2020-03-22', 'SynthSpace Corp', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000003', 'SYNTH-SAT-003', 'SATELLITE', 'active', 1200.000, '{"length": 5.8, "width": 3.2, "height": 4.1}', '2019-07-10', 'EuroSat GmbH', 'Germany', 'MEO'),
('a0000001-0000-0000-0000-000000000004', 'SYNTH-SAT-004', 'SATELLITE', 'active', 350.250, '{"length": 2.1, "width": 1.2, "height": 1.5}', '2021-02-28', 'JaxaTech', 'Japan', 'LEO'),
('a0000001-0000-0000-0000-000000000005', 'SYNTH-SAT-005', 'SATELLITE', 'active', 2000.000, '{"length": 7.2, "width": 4.5, "height": 5.8}', '2018-11-05', 'CNSA-Alt', 'China', 'GEO'),
('a0000001-0000-0000-0000-000000000006', 'SYNTH-SAT-006', 'SATELLITE', 'inactive', 420.000, '{"length": 2.8, "width": 1.5, "height": 1.9}', '2017-06-18', 'Roscomos-Alt', 'Russia', 'MEO'),
('a0000001-0000-0000-0000-000000000007', 'SYNTH-SAT-007', 'SATELLITE', 'active', 680.750, '{"length": 3.9, "width": 2.1, "height": 2.8}', '2020-09-12', 'ISRO-Alt', 'India', 'LEO'),
('a0000001-0000-0000-0000-000000000008', 'SYNTH-SAT-008', 'SATELLITE', 'active', 550.000, '{"length": 3.4, "width": 1.9, "height": 2.3}', '2021-04-07', 'SynthSpace Corp', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000009', 'SYNTH-SAT-009', 'SATELLITE', 'active', 890.250, '{"length": 4.8, "width": 2.6, "height": 3.4}', '2019-12-01', 'EuroSat GmbH', 'Germany', 'GEO'),
('a0000001-0000-0000-0000-000000000010', 'SYNTH-SAT-010', 'SATELLITE', 'active', 320.000, '{"length": 2.0, "width": 1.1, "height": 1.4}', '2022-01-20', 'JaxaTech', 'Japan', 'LEO'),
('a0000001-0000-0000-0000-000000000011', 'SYNTH-SAT-011', 'SATELLITE', 'active', 1500.000, '{"length": 6.2, "width": 3.8, "height": 4.9}', '2018-05-30', 'CNSA-Alt', 'China', 'GEO'),
('a0000001-0000-0000-0000-000000000012', 'SYNTH-SAT-012', 'SATELLITE', 'decommissioned', 280.500, '{"length": 1.8, "width": 1.0, "height": 1.2}', '2015-08-14', 'NASA-Alt', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000013', 'SYNTH-SAT-013', 'SATELLITE', 'active', 445.000, '{"length": 2.9, "width": 1.6, "height": 2.0}', '2020-11-03', 'ESA-Alt', 'Europe', 'MEO'),
('a0000001-0000-0000-0000-000000000014', 'SYNTH-SAT-014', 'SATELLITE', 'active', 720.250, '{"length": 4.2, "width": 2.3, "height": 3.0}', '2019-04-25', 'SynthSpace Corp', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000015', 'SYNTH-SAT-015', 'SATELLITE', 'active', 1100.000, '{"length": 5.5, "width": 3.0, "height": 3.9}', '2020-06-17', 'Roscomos-Alt', 'Russia', 'HEO'),
('a0000001-0000-0000-0000-000000000016', 'SYNTH-SAT-016', 'SATELLITE', 'active', 390.000, '{"length": 2.5, "width": 1.4, "height": 1.7}', '2021-08-09', 'ISRO-Alt', 'India', 'LEO'),
('a0000001-0000-0000-0000-000000000017', 'SYNTH-SAT-017', 'SATELLITE', 'lost', 610.500, '{"length": 3.7, "width": 2.0, "height": 2.6}', '2016-10-22', 'SynthSpace Corp', 'USA', 'LEO'),
('a0000001-0000-0000-0000-000000000018', 'SYNTH-SAT-018', 'SATELLITE', 'active', 850.000, '{"length": 4.6, "width": 2.5, "height": 3.3}', '2019-09-14', 'EuroSat GmbH', 'Germany', 'MEO'),
('a0000001-0000-0000-0000-000000000019', 'SYNTH-SAT-019', 'SATELLITE', 'active', 475.250, '{"length": 3.0, "width": 1.7, "height": 2.1}', '2022-02-11', 'JaxaTech', 'Japan', 'LEO'),
('a0000001-0000-0000-0000-000000000020', 'SYNTH-SAT-020', 'SATELLITE', 'active', 1350.000, '{"length": 5.9, "width": 3.3, "height": 4.3}', '2020-12-05', 'CNSA-Alt', 'China', 'GEO');

-- Insert satellites table entries
INSERT INTO satellites (space_object_id, norad_id, intl_code, satellite_type, power_watts, design_life_years) VALUES
('a0000001-0000-0000-0000-000000000001', 90001, 'SY01S', 'communication', 2500.00, 15),
('a0000001-0000-0000-0000-000000000002', 90002, 'SY02S', 'navigation', 3200.50, 12),
('a0000001-0000-0000-0000-000000000003', 90003, 'SY03S', 'observation', 4500.00, 10),
('a0000001-0000-0000-0000-000000000004', 90004, 'SY04S', 'science', 1800.25, 8),
('a0000001-0000-0000-0000-000000000005', 90005, 'SY05S', 'military', 5500.00, 20),
('a0000001-0000-0000-0000-000000000006', 90006, 'SY06S', 'commercial', 2100.00, 15),
('a0000001-0000-0000-0000-000000000007', 90007, 'SY07S', 'communication', 2800.75, 12),
('a0000001-0000-0000-0000-000000000008', 90008, 'SY08S', 'navigation', 3000.00, 10),
('a0000001-0000-0000-0000-000000000009', 90009, 'SY09S', 'observation', 4200.25, 15),
('a0000001-0000-0000-0000-000000000010', 90010, 'SY10S', 'science', 1500.00, 8),
('a0000001-0000-0000-0000-000000000011', 90011, 'SY11S', 'military', 6000.00, 20),
('a0000001-0000-0000-0000-000000000012', 90012, 'SY12S', 'commercial', 1200.00, 10),
('a0000001-0000-0000-0000-000000000013', 90013, 'SY13S', 'communication', 2600.00, 12),
('a0000001-0000-0000-0000-000000000014', 90014, 'SY14S', 'navigation', 3100.25, 15),
('a0000001-0000-0000-0000-000000000015', 90015, 'SY15S', 'observation', 4800.00, 10),
('a0000001-0000-0000-0000-000000000016', 90016, 'SY16S', 'science', 1900.00, 8),
('a0000001-0000-0000-0000-000000000017', 90017, 'SY17S', 'commercial', 2400.50, 12),
('a0000001-0000-0000-0000-000000000018', 90018, 'SY18S', 'communication', 3500.00, 15),
('a0000001-0000-0000-0000-000000000019', 90019, 'SY19S', 'navigation', 2200.25, 10),
('a0000001-0000-0000-0000-000000000020', 90020, 'SY20S', 'observation', 5000.00, 20);

-- ============================================================
-- 100 SYNTHETIC DEBRIS OBJECTS
-- ============================================================
INSERT INTO space_objects (id, name, object_type, status, mass_kg, dimensions_m, launch_date, operator, country, orbit_type) VALUES
('b0000001-0000-0000-0000-000000000001', 'SYNTH-DEBRIS-001', 'DEBRIS', 'active', 5.250, '{"length": 0.5, "width": 0.3, "height": 0.2}', '2019-01-10', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000002', 'SYNTH-DEBRIS-002', 'DEBRIS', 'active', 12.800, '{"length": 1.2, "width": 0.8, "height": 0.4}', '2018-05-22', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000003', 'SYNTH-DEBRIS-003', 'DEBRIS', 'active', 3.100, '{"length": 0.4, "width": 0.2, "height": 0.15}', '2020-03-15', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000004', 'SYNTH-DEBRIS-004', 'DEBRIS', 'active', 25.500, '{"length": 2.1, "width": 1.5, "height": 0.8}', '2017-08-30', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000005', 'SYNTH-DEBRIS-005', 'DEBRIS', 'active', 8.750, '{"length": 0.8, "width": 0.5, "height": 0.3}', '2021-02-14', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000006', 'SYNTH-DEBRIS-006', 'DEBRIS', 'active', 15.300, '{"length": 1.5, "width": 1.0, "height": 0.6}', '2019-07-28', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000007', 'SYNTH-DEBRIS-007', 'DEBRIS', 'active', 2.400, '{"length": 0.3, "width": 0.2, "height": 0.1}', '2020-11-05', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000008', 'SYNTH-DEBRIS-008', 'DEBRIS', 'active', 45.200, '{"length": 3.2, "width": 2.1, "height": 1.5}', '2016-04-18', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000009', 'SYNTH-DEBRIS-009', 'DEBRIS', 'active', 7.600, '{"length": 0.7, "width": 0.4, "height": 0.25}', '2021-06-20', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000010', 'SYNTH-DEBRIS-010', 'DEBRIS', 'active', 18.900, '{"length": 1.8, "width": 1.2, "height": 0.7}', '2018-09-12', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000011', 'SYNTH-DEBRIS-011', 'DEBRIS', 'active', 4.300, '{"length": 0.5, "width": 0.3, "height": 0.2}', '2020-07-03', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000012', 'SYNTH-DEBRIS-012', 'DEBRIS', 'active', 32.100, '{"length": 2.8, "width": 1.9, "height": 1.1}', '2017-12-08', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000013', 'SYNTH-DEBRIS-013', 'DEBRIS', 'active', 6.200, '{"length": 0.6, "width": 0.4, "height": 0.25}', '2021-01-25', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000014', 'SYNTH-DEBRIS-014', 'DEBRIS', 'active', 11.500, '{"length": 1.1, "width": 0.7, "height": 0.4}', '2019-04-14', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000015', 'SYNTH-DEBRIS-015', 'DEBRIS', 'active', 2.800, '{"length": 0.35, "width": 0.2, "height": 0.12}', '2020-09-30', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000016', 'SYNTH-DEBRIS-016', 'DEBRIS', 'active', 52.400, '{"length": 3.8, "width": 2.5, "height": 1.8}', '2016-02-11', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000017', 'SYNTH-DEBRIS-017', 'DEBRIS', 'active', 9.100, '{"length": 0.9, "width": 0.6, "height": 0.35}', '2021-08-17', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000018', 'SYNTH-DEBRIS-018', 'DEBRIS', 'active', 21.700, '{"length": 2.0, "width": 1.4, "height": 0.9}', '2018-03-25', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000019', 'SYNTH-DEBRIS-019', 'DEBRIS', 'active', 5.900, '{"length": 0.55, "width": 0.35, "height": 0.22}', '2020-05-08', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000020', 'SYNTH-DEBRIS-020', 'DEBRIS', 'active', 14.600, '{"length": 1.4, "width": 0.9, "height": 0.55}', '2019-11-22', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000021', 'SYNTH-DEBRIS-021', 'DEBRIS', 'active', 3.500, '{"length": 0.4, "width": 0.25, "height": 0.15}', '2021-03-18', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000022', 'SYNTH-DEBRIS-022', 'DEBRIS', 'active', 28.300, '{"length": 2.5, "width": 1.7, "height": 1.0}', '2017-06-05', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000023', 'SYNTH-DEBRIS-023', 'DEBRIS', 'active', 7.800, '{"length": 0.75, "width": 0.45, "height": 0.28}', '2020-08-12', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000024', 'SYNTH-DEBRIS-024', 'DEBRIS', 'active', 16.400, '{"length": 1.6, "width": 1.1, "height": 0.65}', '2018-10-30', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000025', 'SYNTH-DEBRIS-025', 'DEBRIS', 'active', 4.100, '{"length": 0.45, "width": 0.28, "height": 0.18}', '2021-05-07', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000026', 'SYNTH-DEBRIS-026', 'DEBRIS', 'active', 38.900, '{"length": 3.1, "width": 2.2, "height": 1.4}', '2016-09-14', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000027', 'SYNTH-DEBRIS-027', 'DEBRIS', 'active', 8.400, '{"length": 0.85, "width": 0.55, "height": 0.32}', '2019-02-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000028', 'SYNTH-DEBRIS-028', 'DEBRIS', 'active', 19.200, '{"length": 1.9, "width": 1.3, "height": 0.8}', '2020-01-15', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000029', 'SYNTH-DEBRIS-029', 'DEBRIS', 'active', 6.500, '{"length": 0.65, "width": 0.4, "height": 0.25}', '2021-07-22', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000030', 'SYNTH-DEBRIS-030', 'DEBRIS', 'active', 13.800, '{"length": 1.3, "width": 0.85, "height": 0.5}', '2018-12-03', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000031', 'SYNTH-DEBRIS-031', 'DEBRIS', 'active', 3.200, '{"length": 0.35, "width": 0.22, "height": 0.14}', '2020-04-19', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000032', 'SYNTH-DEBRIS-032', 'DEBRIS', 'active', 42.600, '{"length": 3.5, "width": 2.4, "height": 1.6}', '2017-01-08', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000033', 'SYNTH-DEBRIS-033', 'DEBRIS', 'active', 9.800, '{"length": 0.95, "width": 0.6, "height": 0.38}', '2021-09-10', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000034', 'SYNTH-DEBRIS-034', 'DEBRIS', 'active', 22.100, '{"length": 2.1, "width": 1.5, "height": 0.95}', '2019-06-27', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000035', 'SYNTH-DEBRIS-035', 'DEBRIS', 'active', 5.400, '{"length": 0.5, "width": 0.32, "height": 0.2}', '2020-10-14', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000036', 'SYNTH-DEBRIS-036', 'DEBRIS', 'active', 17.500, '{"length": 1.7, "width": 1.15, "height": 0.7}', '2018-04-21', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000037', 'SYNTH-DEBRIS-037', 'DEBRIS', 'active', 4.700, '{"length": 0.48, "width": 0.3, "height": 0.19}', '2021-02-05', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000038', 'SYNTH-DEBRIS-038', 'DEBRIS', 'active', 26.800, '{"length": 2.4, "width": 1.65, "height": 1.05}', '2017-07-16', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000039', 'SYNTH-DEBRIS-039', 'DEBRIS', 'active', 8.100, '{"length": 0.8, "width": 0.5, "height": 0.3}', '2020-06-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000040', 'SYNTH-DEBRIS-040', 'DEBRIS', 'active', 15.900, '{"length": 1.55, "width": 1.05, "height": 0.62}', '2019-08-09', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000041', 'SYNTH-DEBRIS-041', 'DEBRIS', 'active', 3.800, '{"length": 0.42, "width": 0.26, "height": 0.16}', '2021-04-12', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000042', 'SYNTH-DEBRIS-042', 'DEBRIS', 'active', 35.200, '{"length": 2.9, "width": 2.0, "height": 1.3}', '2016-11-19', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000043', 'SYNTH-DEBRIS-043', 'DEBRIS', 'active', 10.300, '{"length": 1.0, "width": 0.65, "height": 0.4}', '2020-02-07', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000044', 'SYNTH-DEBRIS-044', 'DEBRIS', 'active', 20.400, '{"length": 2.0, "width": 1.35, "height": 0.85}', '2018-08-04', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000045', 'SYNTH-DEBRIS-045', 'DEBRIS', 'active', 6.800, '{"length": 0.7, "width": 0.42, "height": 0.27}', '2021-10-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000046', 'SYNTH-DEBRIS-046', 'DEBRIS', 'active', 12.700, '{"length": 1.25, "width": 0.82, "height": 0.48}', '2019-03-11', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000047', 'SYNTH-DEBRIS-047', 'DEBRIS', 'active', 4.400, '{"length": 0.46, "width": 0.29, "height": 0.18}', '2020-12-20', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000048', 'SYNTH-DEBRIS-048', 'DEBRIS', 'active', 29.500, '{"length": 2.6, "width": 1.8, "height": 1.15}', '2017-03-29', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000049', 'SYNTH-DEBRIS-049', 'DEBRIS', 'active', 7.300, '{"length": 0.72, "width": 0.44, "height": 0.28}', '2021-06-03', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000050', 'SYNTH-DEBRIS-050', 'DEBRIS', 'active', 18.100, '{"length": 1.8, "width": 1.2, "height": 0.75}', '2019-01-17', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000051', 'SYNTH-DEBRIS-051', 'DEBRIS', 'active', 5.100, '{"length": 0.52, "width": 0.33, "height": 0.21}', '2020-08-25', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000052', 'SYNTH-DEBRIS-052', 'DEBRIS', 'active', 24.300, '{"length": 2.3, "width": 1.6, "height": 1.0}', '2018-01-13', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000053', 'SYNTH-DEBRIS-053', 'DEBRIS', 'active', 8.900, '{"length": 0.88, "width": 0.57, "height": 0.35}', '2021-01-08', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000054', 'SYNTH-DEBRIS-054', 'DEBRIS', 'active', 16.200, '{"length": 1.6, "width": 1.08, "height": 0.65}', '2019-10-05', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000055', 'SYNTH-DEBRIS-055', 'DEBRIS', 'active', 3.900, '{"length": 0.43, "width": 0.27, "height": 0.17}', '2020-03-22', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000056', 'SYNTH-DEBRIS-056', 'DEBRIS', 'active', 31.700, '{"length": 2.7, "width": 1.9, "height": 1.2}', '2017-05-30', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000057', 'SYNTH-DEBRIS-057', 'DEBRIS', 'active', 9.400, '{"length": 0.92, "width": 0.59, "height": 0.37}', '2021-08-01', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000058', 'SYNTH-DEBRIS-058', 'DEBRIS', 'active', 21.600, '{"length": 2.1, "width": 1.45, "height": 0.9}', '2019-05-14', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000059', 'SYNTH-DEBRIS-059', 'DEBRIS', 'active', 5.600, '{"length": 0.58, "width": 0.36, "height": 0.23}', '2020-11-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000060', 'SYNTH-DEBRIS-060', 'DEBRIS', 'active', 14.100, '{"length": 1.4, "width": 0.92, "height": 0.55}', '2018-06-09', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000061', 'SYNTH-DEBRIS-061', 'DEBRIS', 'active', 4.200, '{"length": 0.44, "width": 0.28, "height": 0.17}', '2021-03-25', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000062', 'SYNTH-DEBRIS-062', 'DEBRIS', 'active', 37.400, '{"length": 3.0, "width": 2.1, "height": 1.35}', '2016-08-17', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000063', 'SYNTH-DEBRIS-063', 'DEBRIS', 'active', 11.200, '{"length": 1.1, "width": 0.72, "height": 0.43}', '2020-07-11', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000064', 'SYNTH-DEBRIS-064', 'DEBRIS', 'active', 23.800, '{"length": 2.2, "width": 1.55, "height": 0.98}', '2019-09-20', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000065', 'SYNTH-DEBRIS-065', 'DEBRIS', 'active', 6.300, '{"length": 0.65, "width": 0.41, "height": 0.26}', '2021-05-18', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000066', 'SYNTH-DEBRIS-066', 'DEBRIS', 'active', 13.500, '{"length": 1.3, "width": 0.87, "height": 0.52}', '2018-02-24', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000067', 'SYNTH-DEBRIS-067', 'DEBRIS', 'active', 4.800, '{"length": 0.5, "width": 0.31, "height": 0.2}', '2020-09-05', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000068', 'SYNTH-DEBRIS-068', 'DEBRIS', 'active', 40.100, '{"length": 3.3, "width": 2.3, "height": 1.5}', '2017-04-12', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000069', 'SYNTH-DEBRIS-069', 'DEBRIS', 'active', 10.600, '{"length": 1.05, "width": 0.68, "height": 0.41}', '2021-07-15', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000070', 'SYNTH-DEBRIS-070', 'DEBRIS', 'active', 19.800, '{"length": 1.95, "width": 1.32, "height": 0.82}', '2019-12-08', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000071', 'SYNTH-DEBRIS-071', 'DEBRIS', 'active', 5.300, '{"length": 0.55, "width": 0.34, "height": 0.22}', '2020-04-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000072', 'SYNTH-DEBRIS-072', 'DEBRIS', 'active', 27.200, '{"length": 2.5, "width": 1.75, "height": 1.1}', '2018-07-19', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000073', 'SYNTH-DEBRIS-073', 'DEBRIS', 'active', 8.600, '{"length": 0.86, "width": 0.56, "height": 0.34}', '2021-09-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000074', 'SYNTH-DEBRIS-074', 'DEBRIS', 'active', 15.400, '{"length": 1.5, "width": 1.02, "height": 0.61}', '2019-04-03', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000075', 'SYNTH-DEBRIS-075', 'DEBRIS', 'active', 3.600, '{"length": 0.39, "width": 0.24, "height": 0.15}', '2020-12-12', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000076', 'SYNTH-DEBRIS-076', 'DEBRIS', 'active', 33.500, '{"length": 2.8, "width": 1.95, "height": 1.25}', '2017-02-05', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000077', 'SYNTH-DEBRIS-077', 'DEBRIS', 'active', 9.700, '{"length": 0.97, "width": 0.62, "height": 0.39}', '2021-04-22', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000078', 'SYNTH-DEBRIS-078', 'DEBRIS', 'active', 20.900, '{"length": 2.05, "width": 1.38, "height": 0.87}', '2019-08-16', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000079', 'SYNTH-DEBRIS-079', 'DEBRIS', 'active', 5.800, '{"length": 0.6, "width": 0.37, "height": 0.24}', '2020-06-01', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000080', 'SYNTH-DEBRIS-080', 'DEBRIS', 'active', 12.300, '{"length": 1.2, "width": 0.78, "height": 0.47}', '2018-11-11', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000081', 'SYNTH-DEBRIS-081', 'DEBRIS', 'active', 4.500, '{"length": 0.47, "width": 0.3, "height": 0.19}', '2021-02-18', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000082', 'SYNTH-DEBRIS-082', 'DEBRIS', 'active', 36.800, '{"length": 3.1, "width": 2.15, "height": 1.4}', '2016-06-25', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000083', 'SYNTH-DEBRIS-083', 'DEBRIS', 'active', 11.800, '{"length": 1.15, "width": 0.75, "height": 0.45}', '2020-10-07', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000084', 'SYNTH-DEBRIS-084', 'DEBRIS', 'active', 22.500, '{"length": 2.15, "width": 1.48, "height": 0.92}', '2019-07-21', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000085', 'SYNTH-DEBRIS-085', 'DEBRIS', 'active', 6.100, '{"length": 0.63, "width": 0.39, "height": 0.25}', '2021-06-14', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000086', 'SYNTH-DEBRIS-086', 'DEBRIS', 'active', 14.800, '{"length": 1.45, "width": 0.95, "height": 0.57}', '2018-03-08', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000087', 'SYNTH-DEBRIS-087', 'DEBRIS', 'active', 4.900, '{"length": 0.51, "width": 0.32, "height": 0.21}', '2020-05-15', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000088', 'SYNTH-DEBRIS-088', 'DEBRIS', 'active', 28.900, '{"length": 2.55, "width": 1.78, "height": 1.12}', '2017-09-02', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000089', 'SYNTH-DEBRIS-089', 'DEBRIS', 'active', 7.900, '{"length": 0.78, "width": 0.49, "height": 0.31}', '2021-01-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000090', 'SYNTH-DEBRIS-090', 'DEBRIS', 'active', 17.300, '{"length": 1.72, "width": 1.12, "height": 0.68}', '2019-11-09', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000091', 'SYNTH-DEBRIS-091', 'DEBRIS', 'active', 3.700, '{"length": 0.41, "width": 0.25, "height": 0.16}', '2020-02-18', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000092', 'SYNTH-DEBRIS-092', 'DEBRIS', 'active', 39.200, '{"length": 3.2, "width": 2.25, "height": 1.45}', '2017-01-22', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000093', 'SYNTH-DEBRIS-093', 'DEBRIS', 'active', 10.100, '{"length": 1.0, "width": 0.64, "height": 0.4}', '2021-10-15', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000094', 'SYNTH-DEBRIS-094', 'DEBRIS', 'active', 21.300, '{"length": 2.08, "width": 1.42, "height": 0.88}', '2019-02-05', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000095', 'SYNTH-DEBRIS-095', 'DEBRIS', 'active', 5.500, '{"length": 0.57, "width": 0.35, "height": 0.23}', '2020-08-02', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000096', 'SYNTH-DEBRIS-096', 'DEBRIS', 'active', 13.200, '{"length": 1.3, "width": 0.85, "height": 0.51}', '2018-05-28', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000097', 'SYNTH-DEBRIS-097', 'DEBRIS', 'active', 4.600, '{"length": 0.48, "width": 0.3, "height": 0.19}', '2021-04-08', 'Unknown', 'Unknown', 'MEO'),
('b0000001-0000-0000-0000-000000000098', 'SYNTH-DEBRIS-098', 'DEBRIS', 'active', 34.600, '{"length": 2.95, "width": 2.05, "height": 1.32}', '2016-10-14', 'Unknown', 'Unknown', 'GEO'),
('b0000001-0000-0000-0000-000000000099', 'SYNTH-DEBRIS-099', 'DEBRIS', 'active', 8.300, '{"length": 0.82, "width": 0.52, "height": 0.33}', '2020-11-21', 'Unknown', 'Unknown', 'LEO'),
('b0000001-0000-0000-0000-000000000100', 'SYNTH-DEBRIS-100', 'DEBRIS', 'active', 16.800, '{"length": 1.65, "width": 1.1, "height": 0.66}', '2019-06-12', 'Unknown', 'Unknown', 'MEO');

-- ============================================================
-- 5 SYNTHETIC ROBOTS
-- ============================================================
INSERT INTO space_objects (id, name, object_type, status, mass_kg, dimensions_m, launch_date, operator, country, orbit_type) VALUES
('c0000001-0000-0000-0000-000000000001', 'SYNTH-ROBOT-001', 'ROBOT', 'active', 150.000, '{"length": 1.8, "width": 1.2, "height": 1.5}', '2021-03-15', 'SpaceBot Inc', 'USA', 'LEO'),
('c0000001-0000-0000-0000-000000000002', 'SYNTH-ROBOT-002', 'ROBOT', 'active', 85.500, '{"length": 1.2, "width": 0.8, "height": 1.0}', '2020-08-22', 'EuroBot GmbH', 'Germany', 'LEO'),
('c0000001-0000-0000-0000-000000000003', 'SYNTH-ROBOT-003', 'ROBOT', 'active', 220.000, '{"length": 2.5, "width": 1.8, "height": 2.0}', '2019-11-10', 'JaxaBot', 'Japan', 'MEO'),
('c0000001-0000-0000-0000-000000000004', 'SYNTH-ROBOT-004', 'ROBOT', 'inactive', 120.750, '{"length": 1.5, "width": 1.0, "height": 1.2}', '2018-04-28', 'SpaceBot Inc', 'USA', 'LEO'),
('c0000001-0000-0000-0000-000000000005', 'SYNTH-ROBOT-005', 'ROBOT', 'active', 180.250, '{"length": 2.0, "width": 1.4, "height": 1.7}', '2021-07-05', 'CNSA-Bot', 'China', 'GEO');

-- Insert robots table entries
INSERT INTO robots (space_object_id, robot_type, manufacturer, autonomy_level, payload_capacity_kg) VALUES
('c0000001-0000-0000-0000-000000000001', 'rover', 'SpaceBot Inc', 4, 50.000),
('c0000001-0000-0000-0000-000000000002', 'arm', 'EuroBot GmbH', 3, 25.500),
('c0000001-0000-0000-0000-000000000003', 'drone', 'JaxaBot', 5, 100.000),
('c0000001-0000-0000-0000-000000000004', 'assembly', 'SpaceBot Inc', 2, 75.250),
('c0000001-0000-0000-0000-000000000005', 'repair', 'CNSA-Bot', 4, 60.000);

-- ============================================================
-- SYNTHETIC ORBITAL STATE VECTORS
-- Position: [x, y, z] in km (ECI frame approximation)
-- Velocity: [vx, vy, vz] in km/s (ECI frame approximation)
-- ============================================================

-- Sample orbital states for a few objects (demonstration data)
INSERT INTO orbital_states (space_object_id, timestamp, position_x_km, position_y_km, position_z_km, velocity_x_kms, velocity_y_kms, velocity_z_kms, altitude_km, inclination_deg, eccentricity, period_minutes)
VALUES
-- ISS-like object in LEO
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour', 6771.0, 0.0, 0.0, 0.0, 7.66, 0.0, 408.0, 51.6, 0.0002, 92.68),
('a0000001-0000-0000-0000-000000000001', NOW(), 6771.0, 0.0, 0.0, 0.0, 7.66, 0.0, 408.0, 51.6, 0.0002, 92.68),

-- GPS-like object in MEO
('a0000001-0000-0000-0000-000000000003', NOW() - INTERVAL '2 hours', 26560.0, 0.0, 0.0, 0.0, 3.87, 0.0, 20200.0, 55.0, 0.02, 718.0),
('a0000001-0000-0000-0000-000000000003', NOW(), 26560.0, 0.0, 0.0, 0.0, 3.87, 0.0, 20200.0, 55.0, 0.02, 718.0),

-- GEO object
('a0000001-0000-0000-0000-000000000005', NOW() - INTERVAL '3 hours', 42164.0, 0.0, 0.0, 0.0, 3.07, 0.0, 35786.0, 0.0, 0.0001, 1436.0),
('a0000001-0000-0000-0000-000000000005', NOW(), 42164.0, 0.0, 0.0, 0.0, 3.07, 0.0, 35786.0, 0.0, 0.0001, 1436.0),

-- Debris in LEO
('b0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', 6871.0, 0.0, 0.0, 0.0, 7.61, 0.0, 508.0, 98.0, 0.001, 95.4),
('b0000001-0000-0000-0000-000000000001', NOW(), 6871.0, 0.0, 0.0, 0.0, 7.61, 0.0, 508.0, 98.0, 0.001, 95.4),

-- Robot in LEO
('c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '45 minutes', 6771.0, 0.0, 0.0, 0.0, 7.66, 0.0, 408.0, 51.6, 0.0002, 92.68),
('c0000001-0000-0000-0000-000000000001', NOW(), 6771.0, 0.0, 0.0, 0.0, 7.66, 0.0, 408.0, 51.6, 0.0002, 92.68);

-- ============================================================
-- SYNTHETIC TELEMETRY DATA
-- ============================================================
INSERT INTO telemetry (space_object_id, timestamp, metric_type, value, unit, metadata)
VALUES
-- ISS-like satellite telemetry
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour', 'power_output', 12500.0, 'watts', '{"solar_panel": "primary"}'),
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '50 minutes', 'temperature', 22.5, 'celsius', '{"location": "habitat"}'),
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '40 minutes', 'battery_level', 87.3, 'percent', '{"battery": "primary"}'),
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', 'signal_strength', -45.2, 'dBm', '{"antenna": "main"}'),
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '20 minutes', 'power_output', 12480.0, 'watts', '{"solar_panel": "primary"}'),
('a0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '10 minutes', 'temperature', 22.8, 'celsius', '{"location": "habitat"}'),
('a0000001-0000-0000-0000-000000000001', NOW(), 'battery_level', 86.9, 'percent', '{"battery": "primary"}'),

-- GPS satellite telemetry
('a0000001-0000-0000-0000-000000000003', NOW() - INTERVAL '2 hours', 'clock_accuracy', 12.5, 'nanoseconds', '{"atomic_clock": "primary"}'),
('a0000001-0000-0000-0000-000000000003', NOW() - INTERVAL '1 hour', 'signal_strength', -120.5, 'dBm', '{"antenna": "navigation"}'),
('a0000001-0000-0000-0000-000000000003', NOW(), 'clock_accuracy', 12.3, 'nanoseconds', '{"atomic_clock": "primary"}'),

-- Debris telemetry (minimal)
('b0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', 'radar_cross_section', 0.5, 'sq_m', '{}'),
('b0000001-0000-0000-0000-000000000001', NOW(), 'radar_cross_section', 0.5, 'sq_m', '{}'),

-- Robot telemetry
('c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '45 minutes', 'battery_level', 92.1, 'percent', '{"battery": "main"}'),
('c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', 'arm_position', 45.0, 'degrees', '{"joint": "shoulder"}'),
('c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '15 minutes', 'temperature', 18.5, 'celsius', '{"location": "electronics"}'),
('c0000001-0000-0000-0000-000000000001', NOW(), 'battery_level', 91.8, 'percent', '{"battery": "main"}');
