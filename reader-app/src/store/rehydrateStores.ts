import { useBookshelf } from "./BookshelfStore";
import { useContinueReading } from "./ContinueReadingStore";
import { useReadingModeOverrides } from "./ReadingModeStore";

// Recarrega os 3 stores locais a partir do namespace do usuário ativo atual.
// Chamado pelo AuthContext após `setActiveUser(...)` em login/logout/restore.
//
// Zeramos o estado em memória ANTES de reidratar porque `persist.rehydrate()`
// não sobrescreve quando o storage retorna null — sem o reset, trocar para uma
// conta sem dados (ou deslogar) manteria em tela os dados da conta anterior.
export async function rehydrateUserStores(): Promise<void> {
  useBookshelf.setState({ entries: [], pageBookmarks: [] });
  useContinueReading.setState({ entries: [] });
  useReadingModeOverrides.setState({ overrides: {} });

  await Promise.all([
    useBookshelf.persist.rehydrate(),
    useContinueReading.persist.rehydrate(),
    useReadingModeOverrides.persist.rehydrate(),
  ]);
}
