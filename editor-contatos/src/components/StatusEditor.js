import React, { useState } from 'react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Button,
  MenuItem,
  Select,
  Typography,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent
} from '@mui/material';

const StatusEditor = ({ bandeira, celular, contatosSelecionados, onUpdateSuccess }) => {
  const [novoStatus, setNovoStatus] = useState('S');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const statusOptions = [
    { value: 'A', label: 'Ativo (A)' },
    { value: 'S', label: 'Standby (S)' },
    { value: 'NC', label: 'Não Contatado (NC)' },
    { value: 'NR', label: 'Não Retornou (NR)' },
    { value: 'X', label: 'Recusado (X)' },
    { value: 'R', label: 'Retornou (R)' }
  ];

  const handleStatusChange = (event) => {
    setNovoStatus(event.target.value);
  };

  const atualizarStatus = async () => {
    if (!bandeira || !celular || contatosSelecionados.length === 0) {
      setSnackbarMessage('Selecione bandeira, celular e pelo menos um contato para atualizar');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      contatosSelecionados.forEach(contatoFullId => {
        const [bloco, contatoId] = contatoFullId.split('|');
        const contatoRef = doc(
          db, 
          `contatos/${bandeira}/celulares/${celular}/blocos/${bloco}/contatos/${contatoId}`
        );
        batch.update(contatoRef, { STATUS: novoStatus });
      });

      await batch.commit();
      
      setSnackbarMessage(`${contatosSelecionados.length} contato(s) atualizado(s) com sucesso para status ${novoStatus}!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Chamar callback para notificar sucesso
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setSnackbarMessage(`Erro ao atualizar status: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Atualização em Massa
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Novo Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={novoStatus}
                label="Novo Status"
                onChange={handleStatusChange}
                fullWidth
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={atualizarStatus}
                disabled={loading || contatosSelecionados.length === 0}
                size="large"
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Atualizar ${contatosSelecionados.length} Contato(s)`
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          Status atual: {statusOptions.find(o => o.value === novoStatus)?.label}
        </Typography>
      </CardContent>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default StatusEditor;