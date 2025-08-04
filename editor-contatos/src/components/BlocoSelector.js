import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Autocomplete, TextField, Chip, Box, CircularProgress, Typography } from '@mui/material';

const BlocoSelector = ({ bandeira, celular, onBlocosSelect }) => {
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBlocos, setSelectedBlocos] = useState([]);

  useEffect(() => {
    if (!bandeira || !celular) {
      setBlocos([]);
      return;
    }

    const fetchBlocos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const blocosCollection = collection(db, `contatos/${bandeira}/celulares/${celular}/blocos`);
        const querySnapshot = await getDocs(blocosCollection);
        
        const blocosData = [];
        querySnapshot.forEach((doc) => {
          blocosData.push(doc.id);
        });
        
        setBlocos(blocosData);
      } catch (err) {
        console.error("Erro ao carregar blocos:", err);
        setError("Falha ao carregar blocos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlocos();
  }, [bandeira, celular]);

  const handleBlocoSelect = (event, value) => {
    if (value && !selectedBlocos.includes(value)) {
      const newSelected = [...selectedBlocos, value];
      setSelectedBlocos(newSelected);
      onBlocosSelect(newSelected);
    }
  };

  const handleDeleteBloco = (blocoToDelete) => {
    const newSelected = selectedBlocos.filter(bloco => bloco !== blocoToDelete);
    setSelectedBlocos(newSelected);
    onBlocosSelect(newSelected);
  };

  return (
    <Box sx={{ marginBottom: '20px' }}>
      <Autocomplete
        options={blocos}
        loading={loading}
        disabled={!bandeira || !celular}
        onChange={handleBlocoSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Selecione os Blocos"
            variant="outlined"
            fullWidth
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      
      {selectedBlocos.length > 0 && (
        <Box sx={{ marginTop: '10px' }}>
          <Typography variant="subtitle2" gutterBottom>
            Blocos selecionados:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedBlocos.map((bloco) => (
              <Chip
                key={bloco}
                label={bloco}
                onDelete={() => handleDeleteBloco(bloco)}
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BlocoSelector;