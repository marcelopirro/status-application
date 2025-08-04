import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  TextField,
  Box,
  CircularProgress,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { Search, Check, Close } from '@mui/icons-material';

const NumeroSelector = ({ bandeira, celular, onNumerosSelecionados }) => {
  const [codigos, setCodigos] = useState([]);
  const [filteredCodigos, setFilteredCodigos] = useState([]);
  const [selectedCodigos, setSelectedCodigos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (!bandeira || !celular) {
      setCodigos([]);
      setSelectedCodigos([]);
      return;
    }

    const fetchAllCodigos = async () => {
      try {
        setLoading(true);
        setError(null);

        const blocosCollection = collection(db, `contatos/${bandeira}/celulares/${celular}/blocos`);
        const blocosSnapshot = await getDocs(blocosCollection);

        const codigosPromises = blocosSnapshot.docs.map(async (blocoDoc) => {
          const blocoRef = doc(db, `contatos/${bandeira}/celulares/${celular}/blocos/${blocoDoc.id}`);
          const blocoSnap = await getDoc(blocoRef);
          const blocoData = blocoSnap.data();

          if (!blocoData) return [];

          return Object.entries(blocoData).map(([codigoId, rawData]) => {
            let data;

            try {
              data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            } catch (e) {
              console.error(`Erro ao fazer parse do código ${codigoId}:`, rawData);
              data = {};
            }

            return {
              id: codigoId,
              bloco: blocoDoc.id,
              codigo: data.CÓDIGO || codigoId,
              ...data
            };
          });
        });

        const codigosArrays = await Promise.all(codigosPromises);
        const allCodigos = codigosArrays.flat();

        setCodigos(allCodigos);
        setFilteredCodigos(allCodigos);
      } catch (err) {
        console.error("Erro ao carregar códigos:", err);
        setError("Falha ao carregar códigos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCodigos();
  }, [bandeira, celular]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCodigos(codigos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = codigos.filter(item =>
        (item.codigo && item.codigo.toLowerCase().includes(term)) ||
        (item.NOME && item.NOME.toLowerCase().includes(term)) ||
        (item['NOME COMPLETO'] && item['NOME COMPLETO'].toLowerCase().includes(term)) ||
        (item.CELULAR && item.CELULAR.toString().includes(searchTerm))
      );
      setFilteredCodigos(filtered);
    }
  }, [searchTerm, codigos]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = () => {
    const newSelected = selectedCodigos.length === filteredCodigos.length ? [] : [...filteredCodigos];
    setSelectedCodigos(newSelected);
    onNumerosSelecionados(newSelected);
  };

  const handleCodigoToggle = (codigo) => {
    const exists = selectedCodigos.some(c => c.id === codigo.id && c.bloco === codigo.bloco);
    let newSelected;
    if (exists) {
      newSelected = selectedCodigos.filter(c => !(c.id === codigo.id && c.bloco === codigo.bloco));
    } else {
      newSelected = [...selectedCodigos, codigo];
    }
    setSelectedCodigos(newSelected);
    onNumerosSelecionados(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedCodigos([]);
    onNumerosSelecionados([]);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por código, nome ou celular..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
          }}
          disabled={loading || !celular}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">
            {filteredCodigos.length} códigos encontrados
          </Typography>

          <Box>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={filteredCodigos.length === 0}
              startIcon={<Check />}
            >
              {selectedCodigos.length === filteredCodigos.length ? 'Desmarcar todos' : 'Marcar todos'}
            </Button>

            <Button
              size="small"
              onClick={handleClearSelection}
              disabled={selectedCodigos.length === 0}
              startIcon={<Close />}
              sx={{ ml: 1 }}
            >
              Limpar seleção
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List dense sx={{
            maxHeight: 400,
            overflow: 'auto',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1
          }}>
            {filteredCodigos.map(item => (
              <ListItem
                key={`${item.bloco}-${item.id}`}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={selectedCodigos.some(c => c.id === item.id && c.bloco === item.bloco)}
                    onChange={() => handleCodigoToggle(item)}
                  />
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.codigo}
                      </Typography>
                      <Chip
                        label={`Bloco: ${item.bloco}`}
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">
                        {item['NOME COMPLETO'] || item.NOME || 'Sem nome'}
                      </Typography>
                      {item.CELULAR && (
                        <Typography variant="caption" color="text.secondary">
                          Celular: {item.CELULAR}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {selectedCodigos.length > 0 && (
          <Box sx={{
            p: 2,
            border: `1px solid ${theme.palette.success.light}`,
            borderRadius: 1,
            backgroundColor: theme.palette.success.light + '08'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <strong>{selectedCodigos.length}</strong> códigos selecionados
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedCodigos.slice(0, 5).map(item => (
                <Chip
                  key={`${item.bloco}-${item.id}`}
                  label={item.codigo}
                  onDelete={() => handleCodigoToggle(item)}
                  size="small"
                />
              ))}
              {selectedCodigos.length > 5 && (
                <Chip label={`+${selectedCodigos.length - 5} mais`} size="small" />
              )}
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default NumeroSelector;
