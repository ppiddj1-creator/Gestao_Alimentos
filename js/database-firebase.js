// database-firebase.js — Versão FIRESTORE (usar no deploy)
// Substituir database.js por este arquivo + configurar firebase-config.js

const Database = {
  async getColecao(nomeColecao) {
    const snapshot = await db.collection(nomeColecao).get();
    const itens = [];
    snapshot.forEach((doc) => {
      itens.push({ id: doc.id, ...doc.data() });
    });
    return itens;
  },

  async getDocumento(nomeColecao, id) {
    const doc = await db.collection(nomeColecao).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async adicionar(nomeColecao, dados, idPersonalizado) {
    if (idPersonalizado) {
      await db.collection(nomeColecao).doc(idPersonalizado).set(dados);
      return idPersonalizado;
    }
    const doc = await db.collection(nomeColecao).add(dados);
    return doc.id;
  },

  async atualizar(nomeColecao, id, dados) {
    await db.collection(nomeColecao).doc(id).update(dados);
  },

  async excluir(nomeColecao, id) {
    await db.collection(nomeColecao).doc(id).delete();
  },

  async buscarPorCampo(nomeColecao, campo, valor) {
    const snapshot = await db.collection(nomeColecao).where(campo, "==", valor).get();
    const itens = [];
    snapshot.forEach((doc) => {
      itens.push({ id: doc.id, ...doc.data() });
    });
    return itens;
  },

  async buscarPorOrdem(nomeColecao, campo) {
    const snapshot = await db.collection(nomeColecao).orderBy(campo).get();
    const itens = [];
    snapshot.forEach((doc) => {
      itens.push({ id: doc.id, ...doc.data() });
    });
    return itens;
  }
};
