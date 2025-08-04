import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Autocomplete, TextField, CircularProgress, Box } from '@mui/material';

const CelularSelector = ({ bandeira, onCelularSelect }) => {
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bandeira) {
      setCelulares([]);
      return;
    }

    const fetchCelulares = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const celularesCollection = collection(db, `contatos/${bandeira}/celulares`);
        const querySnapshot = await getDocs(celularesCollection);
        
        const celularesData = [];
        querySnapshot.forEach((doc) => {
          celularesData.push(doc.id);
        });
        
        setCelulares(celularesData);
      } catch (err) {
        console.error("Erro ao carregar celulares:", err);
        setError("Falha ao carregar celulares. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCelulares();
  }, [bandeira]);

  const handleCelularSelect = (event, value) => {
    onCelularSelect(value);
  };

  return (
    <Box sx={{ marginBottom: '20px' }}>
      <Autocomplete
        options={celulares}
        loading={loading}
        disabled={!bandeira}
        onChange={handleCelularSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Selecione o Celular"
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
    </Box>
  );
};

export default CelularSelector;