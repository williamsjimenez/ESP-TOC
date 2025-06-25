import React, { useState, useEffect, useMemo } from 'react';
import { Search, University, MapPin, DollarSign, BookOpen, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const ESPTOCVisualizer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [error, setError] = useState(null);

  // Cargar datos del archivo Excel
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/ESP_TOC.xlsx');
        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo ESP_TOC.xlsx');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el archivo: ' + err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Datos filtrados
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.NOMBRE_IES?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.NOMBRE_DEL_PROGRAMA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.DEPARTAMENTO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.MUNICIPIO?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUniversity = selectedUniversity === '' || item.NOMBRE_IES === selectedUniversity;
      const matchesDepartment = selectedDepartment === '' || item.DEPARTAMENTO === selectedDepartment;
      const matchesProgram = selectedProgram === '' || item.NOMBRE_DEL_PROGRAMA === selectedProgram;
      
      return matchesSearch && matchesUniversity && matchesDepartment && matchesProgram;
    });
  }, [data, searchTerm, selectedUniversity, selectedDepartment, selectedProgram]);

  // Listas únicas para filtros
  const universities = useMemo(() => {
    return [...new Set(data.map(item => item.NOMBRE_IES))].sort();
  }, [data]);

  const departments = useMemo(() => {
    return [...new Set(data.map(item => item.DEPARTAMENTO))].sort();
  }, [data]);

  const programs = useMemo(() => {
    return [...new Set(data.map(item => item.NOMBRE_DEL_PROGRAMA))].sort();
  }, [data]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      totalPrograms: filteredData.length,
      uniqueUniversities: new Set(filteredData.map(item => item.NOMBRE_IES)).size,
      uniqueDepartments: new Set(filteredData.map(item => item.DEPARTAMENTO)).size,
      avgMatricula: filteredData.length > 0 ? 
        filteredData.reduce((sum, item) => sum + (item.VALOR_MATRICULA || 0), 0) / filteredData.length : 0
    };
  }, [filteredData]);

  const formatCurrency = (value) => {
    if (!value) return 'No disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedUniversity('');
    setSelectedDepartment('');
    setSelectedProgram('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Asegúrate de que el archivo ESP_TOC.xlsx esté en la carpeta public/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <University className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Visualizador ESP TOC - Especialidades Médicas
            </h1>
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Programas</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalPrograms}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <University className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Universidades</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.uniqueUniversities}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Departamentos</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{stats.uniqueDepartments}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Matrícula Promedio</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{formatCurrency(stats.avgMatricula)}</p>
            </div>
          </div>

          {/* Controles de búsqueda y filtros */}
          <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por universidad, programa, departamento o municipio..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="">Todas las universidades</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>

              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Todos los departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="">Todos los programas</option>
                {programs.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            {/* Botón limpiar filtros */}
            {(searchTerm || selectedUniversity || selectedDepartment || selectedProgram) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Resultados ({filteredData.length} programas encontrados)
            </h2>
          </div>

          {filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron programas con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código SNIES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Universidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Cubrimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Matrícula
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.CÓDIGO_SNIES_DEL_PROGRAMA}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{item.NOMBRE_DEL_PROGRAMA}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{item.NOMBRE_IES}</div>
                        <div className="text-xs text-gray-500">Código: {item.CODIGO_IES}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <div>{item.MUNICIPIO}</div>
                            <div className="text-xs text-gray-500">{item.DEPARTAMENTO}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.TIPO_CUBRIMIENTO}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium text-green-600">
                          {formatCurrency(item.VALOR_MATRICULA)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESPTOCVisualizer;
