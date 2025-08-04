import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Button } from '@mui/material';

const BandeiraSelector = ({ onBandeiraSelect }) => {
  const [bandeiras, setBandeiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBandeiras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Buscando documentos/bandeiras...");

      // 1. Acessa a coleção 'contatos'
      const contatosRef = collection(db, 'contatos');
      const querySnapshot = await getDocs(contatosRef);
      
      console.log("Documentos encontrados:", querySnapshot.docs.map(doc => doc.id));

      // 2. Verifica se encontrou documentos
      if (querySnapshot.empty) {
        throw new Error("Nenhuma bandeira encontrada. A coleção 'contatos' está vazia.");
      }

      // 3. Pega apenas os IDs dos documentos (AA, ZA, etc.)
      const bandeirasEncontradas = querySnapshot.docs.map(doc => doc.id);
      
      setBandeiras(bandeirasEncontradas);
      setError(null);

    } catch (err) {
      console.error("Erro ao carregar bandeiras:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBandeiras();
  }, [fetchBandeiras]);

  const handleRetry = () => {
    fetchBandeiras();
  };

  const handleBandeiraSelect = (event, value) => {
    console.log("Bandeira selecionada:", value);
    onBandeiraSelect(value);
  };

  return (
    <Box sx={{ mb: 3, width: '100%' }}>
      <Autocomplete
        options={bandeiras}
        loading={loading}
        onChange={handleBandeiraSelect}
        noOptionsText={error || "Nenhuma bandeira disponível"}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Selecione a Bandeira"
            variant="outlined"
            fullWidth
            error={!!error}
            helperText={error ? '' : loading ? 'Carregando...' : `${bandeiras.length} bandeiras encontradas`}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleRetry}
            sx={{ mt: 1 }}
          >
            Tentar novamente
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BandeiraSelector;