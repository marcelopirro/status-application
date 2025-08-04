import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Divider,
  Paper
} from '@mui/material';

const ContatosList = ({ bandeira, celular, blocos, onContatosSelect }) => {
  const [contatos, setContatos] = useState([]);
  const [selectedContatos, setSelectedContatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBlocos, setLoadingBlocos] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bandeira || !celular || blocos.length === 0) {
      setContatos([]);
      return;
    }

    const fetchContatos = async () => {
      try {
        setLoading(true);
        setError(null);
        setContatos([]);
        
        const allContatos = [];
        
        await Promise.all(blocos.map(async (bloco) => {
          try {
            setLoadingBlocos(prev => ({ ...prev, [bloco]: true }));
            
            const contatosCollection = collection(
              db, 
              `contatos/${bandeira}/celulares/${celular}/blocos/${bloco}/contatos`
            );
            
            const querySnapshot = await getDocs(contatosCollection);
            
            querySnapshot.forEach((doc) => {
              const contatoData = doc.data();
              allContatos.push({
                id: `${bloco}|${doc.id}`,
                docId: doc.id,
                codigo: contatoData['CÓDIGO'] || '',
                nome: contatoData['NOME COMPLETO'] || contatoData['NOME'] || '',
                status: contatoData['STATUS'] || '',
                bloco,
                data: contatoData
              });
            });
          } catch (err) {
            console.error(`Erro ao carregar contatos do bloco ${bloco}:`, err);
          } finally {
            setLoadingBlocos(prev => ({ ...prev, [bloco]: false }));
          }
        }));
        
        setContatos(allContatos);
      } catch (err) {
        console.error("Erro geral ao carregar contatos:", err);
        setError("Falha ao carregar contatos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchContatos();
  }, [bandeira, celular, blocos]);

  const handleToggle = (contatoId) => () => {
    const currentIndex = selectedContatos.indexOf(contatoId);
    const newSelected = [...selectedContatos];

    if (currentIndex === -1) {
      newSelected.push(contatoId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedContatos(newSelected);
    onContatosSelect(newSelected);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '20px', color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!bandeira || !celular || blocos.length === 0) {
    return (
      <Box sx={{ padding: '20px' }}>
        <Typography>Selecione uma bandeira, celular e pelo menos um bloco para visualizar os contatos</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ marginBottom: '20px' }}>
      <Box sx={{ padding: '16px' }}>
        <Typography variant="h6" gutterBottom>
          Contatos ({contatos.length} encontrados)
        </Typography>
        
        {blocos.map(bloco => (
          loadingBlocos[bloco] && (
            <Box key={`loading-${bloco}`} sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <CircularProgress size={20} sx={{ marginRight: '8px' }} />
              <Typography>Carregando {bloco}...</Typography>
            </Box>
          )
        ))}
      </Box>
      
      <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {contatos.map((contato, index) => (
          <React.Fragment key={contato.id}>
            <ListItem
              secondaryAction={
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 'bold',
                    color: contato.status === 'S' ? 'primary.main' : 
                           contato.status === 'A' ? 'success.main' : 
                           contato.status === 'NC' ? 'warning.main' : 
                           contato.status === 'NR' ? 'error.main' : 'text.secondary'
                  }}
                >
                  {contato.status}
                </Typography>
              }
              disablePadding
            >
              <ListItemButton onClick={handleToggle(contato.id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedContatos.indexOf(contato.id) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={contato.nome} 
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block' }}
                      >
                        {contato.codigo}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        Bloco: {contato.bloco}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < contatos.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ContatosList;